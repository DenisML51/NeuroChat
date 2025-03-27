import mlflow
from transformers import pipeline
generator = pipeline("text-generation", model="gpt2")

def generate_response(context: str, user_input: str, max_new_tokens: int = 50) -> str:
    prompt = context + "\nUser: " + user_input + "\nBot:"
    with mlflow.start_run() as run:
        responses = generator(prompt, max_new_tokens=max_new_tokens, num_return_sequences=1)
        generated_text = responses[0]['generated_text']
        bot_reply = generated_text.split("Bot:")[-1].strip()
        mlflow.log_param("max_new_tokens", max_new_tokens)
        mlflow.log_param("prompt_length", len(prompt))
        mlflow.log_metric("response_length", len(bot_reply))
        mlflow.log_text(prompt, "prompt.txt")
        mlflow.log_text(bot_reply, "bot_reply.txt")
    return bot_reply
