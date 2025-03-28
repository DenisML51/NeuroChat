from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from typing import List, Dict, Tuple
import logging
import time

logger = logging.getLogger(__name__)


class OptimizedPhi2Wrapper:
    def __init__(self):
        self.model_name = "microsoft/phi-2"
        self.tokenizer = None
        self.model = None
        self.load_model()

    def load_model(self):
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,
                device_map="cpu",
                trust_remote_code=True,
                attn_implementation="eager"  # Отключаем flash-attn
            )
            self.tokenizer.pad_token = self.tokenizer.eos_token
            logger.info("Phi-2 CPU optimized model loaded")
        except Exception as e:
            logger.error(f"Load error: {str(e)}")
            raise

    def format_prompt(self, messages: List[Dict]) -> str:
        prompt = "Instruct: Ты полезный AI ассистент. Отвечай на русском языке кратко.\n\n"
        for msg in messages:
            if msg['role'] == 'user':
                prompt += f"Вопрос: {msg['content']}\n"
            elif msg['role'] == 'assistant':
                prompt += f"Ответ: {msg['content']}\n"
        return prompt + "Ответ:"

    def generate_response(self, messages: List[Dict]) -> Tuple[str, int]:
        start_time = time.time()
        try:
            prompt = self.format_prompt(messages)

            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                return_attention_mask=True
            )

            outputs = self.model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=self.tokenizer.eos_token_id,
                num_beams=1  # Ускоряет генерацию на CPU
            )

            response = self.tokenizer.decode(
                outputs[0][inputs.input_ids.shape[1]:],
                skip_special_tokens=True
            )

            return response.strip(), outputs.shape[1]

        except Exception as e:
            logger.error(f"Gen error: {str(e)}")
            return "Произошла ошибка обработки запроса", 0
        finally:
            logger.info(f"Generation time: {time.time() - start_time:.2f}s")


phi2_model = OptimizedPhi2Wrapper()


def generate_response(messages: List[Dict]) -> Tuple[str, int]:
    return phi2_model.generate_response(messages)