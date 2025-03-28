import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import logging
from threading import Lock
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)


class DollyChatProcessor:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipe = None
        self.lock = Lock()
        self.load_model()

    def load_model(self):
        """
        Загружаем Dolly v2 3B на CPU.
        """
        try:
            model_id = "databricks/dolly-v2-3b"
            # Загружаем токенизатор
            self.tokenizer = AutoTokenizer.from_pretrained(model_id)
            # Загружаем модель на CPU (по умолчанию device_map='cpu', если не указано иное)
            self.model = AutoModelForCausalLM.from_pretrained(model_id)
            # У Dolly может не быть pad_token – в таком случае используем eos_token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model.eval()

            # Создаём pipeline с явно указанным устройством CPU
            self.pipe = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device="cpu"
            )
            return True
        except Exception as e:
            logger.error(f"Model loading error: {str(e)}")
            return False

    def prepare_chat_history(self, messages: List[Dict]) -> str:
        """
        Формируем промпт, где вся предыдущая история идёт в виде скрытого контекста,
        а последнее сообщение пользователя подаётся в явном виде.

        Dolly v2 – инструкционная модель, поэтому в системном сообщении
        указываем: «Ты помощник, отвечай кратко или подробно по необходимости».
        """
        system_prompt = (
            "You are a helpful AI assistant. "
            "Answer the user's question accurately. "
            "If the question can be answered briefly, do so. "
            "If it requires explanation, provide details. "
            "Focus on being correct and concise."
        )
        if not messages:
            # Если нет истории
            return f"{system_prompt}\nUser: \nAssistant:"

        # Считаем последнее сообщение от пользователя текущим запросом
        if messages[-1]["role"] == "user":
            prev_messages = messages[:-1]
            current_query = messages[-1]["content"].strip()
        else:
            # Если по каким-то причинам последнее сообщение не от user
            prev_messages = messages
            current_query = ""

        # Собираем предыдущие реплики в одну строку (скрытый контекст)
        if prev_messages:
            context_str = "Previous conversation:\n"
            for msg in prev_messages:
                role = msg["role"].capitalize()
                content = msg["content"].strip()
                context_str += f"{role}: {content}\n"
        else:
            context_str = ""

        # Итоговый промпт
        prompt = (
            f"{system_prompt}\n"
            f"{context_str}"
            f"User: {current_query}\n"
            "Assistant:"
        )
        return prompt

    def generate_response(self, messages: List[Dict]) -> Tuple[str, int]:
        with self.lock:
            try:
                if not messages or not isinstance(messages, list):
                    return "Invalid chat history format", 0

                prompt = self.prepare_chat_history(messages)
                # Параметры генерации (можно экспериментировать)
                out = self.pipe(
                    prompt,
                    max_new_tokens=200,
                    do_sample=True,
                    top_p=0.9,
                    temperature=0.6,
                    no_repeat_ngram_size=3,
                    repetition_penalty=1.3
                )
                # Извлекаем ответ, отсекая исходный промпт
                generated_text = out[0]["generated_text"][len(prompt):]
                # Подсчёт слов (условно)
                return generated_text.strip(), len(generated_text.split())

            except Exception as e:
                logger.error(f"Generation error: {str(e)}")
                return "Error generating response", 0


# Глобальный экземпляр процессора
chat_processor = DollyChatProcessor()


def generate_response(messages: List[Dict]) -> Tuple[str, int]:
    """
    Функция, которую вызывает ваш роутер, передавая историю сообщений.
    Возвращает кортеж (текст_ответа, количество_слов).
    """
    if not chat_processor.model:
        return "Model not loaded", 0
    return chat_processor.generate_response(messages)
