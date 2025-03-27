import time
import mlflow
from transformers import pipeline

# Инициализируем pipeline для генерации текста (GPT-2)
generator = pipeline("text-generation", model="gpt2")

def generate_response(context: str, user_input: str, max_length: int = 150) -> str:
    prompt = context + "\nUser: " + user_input + "\nBot:"
    start_time = time.time()
    # Запуск MLFlow run для логирования генерации ответа
    with mlflow.start_run(nested=True):
        mlflow.log_param("prompt", prompt)
        mlflow.log_param("max_length", max_length)
        responses = generator(prompt, max_length=max_length, num_return_sequences=1)
        generation_time = time.time() - start_time
        generated_text = responses[0]['generated_text']
        bot_reply = generated_text.split("Bot:")[-1].strip()
        mlflow.log_metric("generation_time", generation_time)
        mlflow.log_metric("response_length", len(bot_reply))
    return bot_reply
