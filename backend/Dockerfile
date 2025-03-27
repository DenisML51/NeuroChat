FROM python:3.12

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV CARGO_HOME=/root/.cargo
ENV RUSTUP_HOME=/root/.rustup
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

ENV PATH="$CARGO_HOME/bin:$PATH"

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
