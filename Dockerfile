FROM python:3.9-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

# Copia primero los requirements e instálalos
COPY ./requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copia el entrypoint y dale permisos
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Luego copia el resto de los archivos
COPY . .

ENTRYPOINT ["/entrypoint.sh"]