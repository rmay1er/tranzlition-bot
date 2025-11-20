# Используем официальный образ Bun для сборки
FROM oven/bun:1.3-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и bun.lockb для установки зависимостей
COPY package.json bun.lockb* ./

# Устанавливаем зависимости
RUN bun install --frozen-lockfile --production

# Копируем исходный код
COPY . .

# Собираем проект в JavaScript
RUN bun run build

# Финальный образ для продакшена
FROM oven/bun:1.3-alpine AS runtime

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из стадии сборки
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

# Запускаем бота в продакшене
CMD ["bun", "run", "start"]
