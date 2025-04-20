# Sistema de Tickets con Django y Docker

## Requisitos
- Docker
- Docker Compose

## Configuración
1. Copiar el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Editar las variables en `.env` según necesites

## Uso
```bash
# Construir y levantar los contenedores
docker-compose up -d --build

# Detener los contenedores
docker-compose down

# Ver logs
docker-compose logs -f web
```

## Acceso
- Aplicación: http://localhost:8000
- Admin: http://localhost:8000/admin