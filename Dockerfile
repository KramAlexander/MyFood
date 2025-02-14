FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENV FLASK_APP=app/app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8000

# Ensure migrations are applied at container startup
RUN flask db upgrade || flask db init && flask db migrate -m "Initial migration" && flask db upgrade

CMD ["python", "-m", "flask", "run"]
