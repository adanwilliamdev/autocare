FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY pyproject.toml ./
COPY app ./app
RUN pip install --no-cache-dir .
COPY alembic.ini ./
COPY alembic ./alembic

RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
# Aplica as migrations e sobe a API. Com várias réplicas, rode `alembic upgrade head`
# como um job separado em vez de em cada container.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
