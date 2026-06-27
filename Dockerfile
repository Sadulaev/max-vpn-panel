# Production build для React + Vite приложения

FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production=false

# Копируем исходники
COPY . .

# Build аргументы для Vite переменных окружения
ARG VITE_API_URL
ARG VITE_ADMIN_USERNAME
ARG VITE_ADMIN_PASSWORD

# Создаём .env файл из build args
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_ADMIN_USERNAME=${VITE_ADMIN_USERNAME}" >> .env && \
    echo "VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}" >> .env

# Собираем production build
RUN npm run build

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

# Удаляем исходники и dev зависимости (оставляем только dist/)
RUN rm -rf src node_modules package*.json tsconfig.json vite.config.ts

# Здоровье контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:6000/ || exit 1

EXPOSE 6000

# Запускаем serve для раздачи статики
CMD ["serve", "-s", "dist", "-l", "6000"]
