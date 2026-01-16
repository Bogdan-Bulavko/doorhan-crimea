#!/bin/bash
# Скрипт деплоя БЕЗ обновления БД
# Создается и запускается через SSH

set -e

SERVER_PATH="/var/www/doorhan-crimea"
LOG_FILE="${SERVER_PATH}/deploy-remote-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo "✅ $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "❌ $1" | tee -a "$LOG_FILE"
}

cd "$SERVER_PATH"

# Шаг 1: Резервная копия БД (на всякий случай)
log "Создание резервной копии БД..."
mkdir -p ~/backups
if [ -f "prisma/dev.db" ]; then
    cp prisma/dev.db ~/backups/dev_backup_$(date +%Y%m%d_%H%M%S).db
    log_success "Резервная копия БД создана"
fi

# Шаг 2: Остановка приложения
log "Остановка приложения..."
pm2 stop doorhan-crimea 2>/dev/null || pm2 stop all 2>/dev/null || log "Приложение не было запущено"

# Шаг 3: Получение обновлений из Git
log "Получение обновлений из Git..."
git fetch origin
git checkout copy/main
git pull origin copy/main
log_success "Обновления получены из Git"

# Шаг 4: Установка зависимостей
log "Установка зависимостей..."
npm install 2>&1 | tee -a "$LOG_FILE"
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_success "Зависимости установлены"
else
    log_error "Ошибка при установке зависимостей"
    exit 1
fi

# Шаг 5: Генерация Prisma Client (БЕЗ обновления схемы БД)
log "Генерация Prisma Client..."
npx prisma generate 2>&1 | tee -a "$LOG_FILE"
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_success "Prisma Client сгенерирован"
else
    log_error "Ошибка при генерации Prisma Client"
    exit 1
fi

# ⚠️ НЕ ПРИМЕНЯЕМ МИГРАЦИИ - оставляем БД как есть
log "⚠️ Миграции БД пропущены - БД остается без изменений"

# Шаг 6: Сборка проекта
log "Сборка проекта..."
npm run build 2>&1 | tee -a "$LOG_FILE"
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_success "Проект собран"
else
    log_error "Ошибка при сборке проекта"
    exit 1
fi

# Шаг 7: Запуск приложения
log "Запуск приложения..."
pm2 restart doorhan-crimea 2>/dev/null || pm2 start npm --name "doorhan-crimea" -- start 2>&1 | tee -a "$LOG_FILE"
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_success "Приложение запущено"
else
    log_error "Ошибка при запуске приложения"
    exit 1
fi

# Шаг 8: Перезагрузка Nginx
log "Перезагрузка Nginx..."
nginx -t 2>&1 | tee -a "$LOG_FILE"
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    nginx -s reload 2>&1 | tee -a "$LOG_FILE" || systemctl reload nginx 2>&1 | tee -a "$LOG_FILE"
    log_success "Nginx перезагружен"
else
    log "Ошибка в конфигурации Nginx, пропускаем перезагрузку"
fi

log_success "Деплой завершен успешно! БД не была изменена."
echo ""
echo "📊 Статус приложения:"
pm2 status
echo ""
echo "📋 Последние логи:"
pm2 logs doorhan-crimea --lines 10 --nostream
