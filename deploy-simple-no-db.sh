#!/bin/bash
# Простой деплой через Git БЕЗ загрузки БД
# Использует deploy-remote-no-db.sh на сервере

set -e

SERVER_HOST="91.240.86.16"
SERVER_USER="root"
SERVER_PASSWORD="x5S14CvJRmoF0KUaImJH"
SERVER_PATH="/var/www/doorhan-crimea"

echo "🚀 Деплой на сервер (БЕЗ загрузки БД)"
echo "Сервер: $SERVER_HOST"
echo ""

# Загружаем скрипт на сервер
echo "📤 Загрузка скрипта деплоя на сервер..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_HOST << 'ENDSSH'
cd /var/www/doorhan-crimea
cat > deploy-remote-no-db.sh << 'SCRIPT_EOF'
#!/bin/bash
# Скрипт деплоя БЕЗ обновления БД
set -e
SERVER_PATH="/var/www/doorhan-crimea"
cd "$SERVER_PATH"

# Резервная копия БД
mkdir -p ~/backups
[ -f "prisma/dev.db" ] && cp prisma/dev.db ~/backups/dev_backup_$(date +%Y%m%d_%H%M%S).db || true

# Остановка приложения
pm2 stop doorhan-crimea 2>/dev/null || true

# Получение обновлений из Git
git fetch origin
git checkout copy/main
git pull origin copy/main

# Установка зависимостей
npm install

# Генерация Prisma Client (БЕЗ обновления схемы БД)
npx prisma generate

# ⚠️ НЕ ПРИМЕНЯЕМ МИГРАЦИИ - оставляем БД как есть

# Сборка проекта
npm run build

# Запуск приложения
pm2 restart doorhan-crimea || pm2 start npm --name "doorhan-crimea" -- start

# Перезагрузка Nginx
nginx -t && nginx -s reload || systemctl reload nginx || true

echo "✅ Деплой завершен! БД не была изменена."
pm2 status
SCRIPT_EOF
chmod +x deploy-remote-no-db.sh
ENDSSH

# Запускаем деплой на сервере
echo "🔄 Запуск деплоя на сервере..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_HOST "cd $SERVER_PATH && bash deploy-remote-no-db.sh"

echo ""
echo "✅ Деплой завершен!"
