FROM python:3.8-slim

# Configuración básica
WORKDIR /app
COPY . /app

# Instalar dependencias
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Puerto expuesto
EXPOSE 5005

# Comando de inicio
CMD ["rasa", "run", "--enable-api", "--cors", "*"]