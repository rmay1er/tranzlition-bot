# Финальный образ для продакшена
FROM oven/bun:1.3-alpine AS runtime

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из стадии сборки
COPY /package.json /app/package.json
COPY /bot.js /app/bot.js
COPY /node_modules /app/node_modules
COPY /instructions.json /app/instructions.json

# Запускаем бота в продакшене
CMD ["bun", "run", "dev"]
