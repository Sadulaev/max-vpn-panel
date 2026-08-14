# Production build для React + Vite приложения

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production=false

COPY . .

ARG VITE_API_URL
ARG VITE_ADMIN_USERNAME
ARG VITE_ADMIN_PASSWORD

RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_ADMIN_USERNAME=${VITE_ADMIN_USERNAME}" >> .env && \
    echo "VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}" >> .env

RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache wget

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:6000/ || exit 1

EXPOSE 6000

CMD ["nginx", "-g", "daemon off;"]
