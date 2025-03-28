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
        Загружаем Dolly v2 3B на CPU (или другую инструкционную модель).
        """
        try:
            model_id = "databricks/dolly-v2-3b"
            self.tokenizer = AutoTokenizer.from_pretrained(model_id)
            self.model = AutoModelForCausalLM.from_pretrained(model_id)
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            self.model.eval()
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

    def prepare_prompt(self, context_text: str, user_message: str) -> str:
        """
        Формируем финальный промпт:

        Context: <сжатая/полная история диалога>
        User: <текущее сообщение пользователя>
        Assistant:

        Контекст – скрытая часть, которую модель может использовать,
        но мы явно даём понять, что ответ нужен на последний запрос.
        """
        system_instructions = (
            "You are a helpful AI assistant NeuroChat and vary glad to answer user's questions. "
            "Focus on answering the last user question accurately. "
            "Do not continue the conversation from the user's side, only respond as 'Assistant'."
        )

        # Можно добавить system_instructions в начало, если нужно:
        prompt = (
            f"{system_instructions}\n"
            f"Context: {context_text}\n"
            f"User: {user_message}\n"
            "Assistant:"
        )
        return prompt

    def generate_response(self, messages: List[Dict]) -> Tuple[str, int]:
        """
        Генерация ответа с учётом предыдущего контекста (в сжатом виде)
        и последнего сообщения пользователя.
        """
        with self.lock:
            try:
                if not messages or not isinstance(messages, list):
                    return "Invalid chat history format", 0

                # Последнее сообщение должно быть от пользователя
                if messages[-1]["role"] != "user":
                    return "No user message to respond to", 0

                # Текущее сообщение (последнее)
                user_message = messages[-1]["content"].strip()
                # Формируем контекст (все предыдущие сообщения, кроме последнего)
                # Можно их суммаризировать или просто склеить
                context_parts = []
                for msg in messages[:-1]:
                    # Можно убрать из контекста часть системных или длинных сообщений,
                    # либо ограничиться N последними сообщениями
                    # Но для простоты — просто склеим
                    role = msg["role"].capitalize()
                    text = msg["content"].strip()
                    context_parts.append(f"{role}: {text}")
                # Склеиваем контекст одной строкой
                context_text = " ".join(context_parts)

                prompt = self.prepare_prompt(context_text, user_message)

                out = self.pipe(
                    prompt,
                    max_new_tokens=150,
                    do_sample=True,
                    top_p=0.9,
                    temperature=0.65,
                    no_repeat_ngram_size=3,
                    repetition_penalty=1.5
                )
                # Отсекаем сам prompt
                generated_text = out[0]["generated_text"][len(prompt):]
                # Если модель начинает генерировать новый "User:", убираем всё после него
                if "User:" in generated_text:
                    generated_text = generated_text.split("User:")[0]

                answer = generated_text.strip()
                # Подсчитываем «условное» количество слов
                return answer, len(answer.split())
            except Exception as e:
                logger.error(f"Generation error: {str(e)}")
                return "Error generating response", 0


# Глобальный экземпляр
chat_processor = DollyChatProcessor()


def generate_response(messages: List[Dict]) -> Tuple[str, int]:
    if not chat_processor.model:
        return "Model not loaded", 0
    return chat_processor.generate_response(messages)
