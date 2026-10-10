FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m app && chown -R app /app
USER app
# Train the baseline on first start if no model exists, then serve.
CMD ["sh", "-c", "[ -f model_store/baseline-v1.joblib ] || python -m app.ml.train; uvicorn app.main:app --host 0.0.0.0 --port 8000"]
