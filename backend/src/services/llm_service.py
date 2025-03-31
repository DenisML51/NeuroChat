import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import logging
from threading import Lock
from typing import List, Dict, Tuple
import re

logger = logging.getLogger(__name__)

class NeuroChatProcessor:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipe = None
        self.lock = Lock()
        self.load_model()

    def load_model(self):
        try:
            model_id = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
            self.tokenizer = AutoTokenizer.from_pretrained(model_id)
            self.model = AutoModelForCausalLM.from_pretrained(model_id)
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
            self.model.eval()
            
            self.pipe = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device="cuda" if torch.cuda.is_available() else "cpu",
                max_new_tokens=50,
                do_sample=True,
                temperature=0.4,
                top_p=0.85,
                top_k=40,
                repetition_penalty=1.2,
                no_repeat_ngram_size=2,
                eos_token_id=self.tokenizer.eos_token_id,
                pad_token_id=self.tokenizer.eos_token_id
            )
            return True
        except Exception as e:
            logger.error(f"Model loading error: {str(e)}")
            return False

    def prepare_prompt(self, messages: List[Dict]) -> str:
        system_content = (
            "You are NeuroChat, a helpful AI assistant. "
            "Follow these rules:\n"
            "1. Be concise and direct\n"
            "2. Use the same language as user\n"
            "3. For simple questions (math, facts) give short answers\n"
            "4. Format answers clearly\n"
            "5. Avoid Chinese characters\n"
        )

        if not messages or messages[-1]["role"] != "user":
            return ""

        formatted_dialog = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"].strip()
            formatted_dialog.append(f"<|im_start|>{role}\n{content}<|im_end|>")
        
        prompt = [
            "<|im_start|>system",
            system_content,
            "<|im_end|>",
            *formatted_dialog,
            "<|im_start|>assistant\n"
        ]
        
        return "\n".join(prompt)

    def postprocess_response(self, text: str) -> str:
        text = re.sub("[\u4e00-\u9FFF]", "", text)
        text = re.split(r"[\n<]", text)[0]
        text = re.sub(r"\s+", " ", text).strip()
        text = re.sub(r"([?.!])$", r"\1", text)
        return text

    def generate_response(self, messages: List[Dict]) -> Tuple[str, int]:
        with self.lock:
            try:
                prompt = self.prepare_prompt(messages)
                if not prompt:
                    return "Invalid conversation format", 0
                
                output = self.pipe(prompt)
                full_text = output[0]["generated_text"]
                
                response = full_text[len(prompt):]
                processed = self.postprocess_response(response)
                
                return processed, len(processed.split())
            except Exception as e:
                logger.error(f"Generation error: {str(e)}")
                return "Error generating response", 0

chat_processor = NeuroChatProcessor()

def generate_response(messages: List[Dict]) -> Tuple[str, int]:
    if not chat_processor.model:
        return "Model not loaded", 0
    return chat_processor.generate_response(messages)