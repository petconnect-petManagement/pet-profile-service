# Etapa 1: Construcción - instalación de dependencias
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y lock para aprovechar caché
COPY package*.json ./

# Instalar solo las dependencias de producción
RUN npm install --only=production

# Copiar el resto del código
COPY . .

# Etapa 2: Imagen final optimizada
FROM node:20-alpine

WORKDIR /app

# Copiar archivos desde el builder
COPY --from=builder /app /app

# Exponer el puerto que usa este microservicio
EXPOSE 3003

# Comando de inicio
CMD ["node", "server.js"]
