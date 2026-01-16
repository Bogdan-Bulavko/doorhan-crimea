#!/bin/bash
# Быстрая проверка БД на продакшене
# Использование: 
#   1. Скопируйте этот скрипт на сервер
#   2. Или выполните команды вручную через SSH

echo "🔍 Проверка базы данных на продакшене"
echo "======================================"
echo ""

# Подключитесь к серверу и выполните эти команды:
echo "Выполните на сервере:"
echo ""
echo "ssh root@91.240.86.16"
echo "cd /var/www/doorhan-crimea"
echo ""
echo "Затем выполните:"
echo ""
echo "# 1. Проверка настроек"
echo "sqlite3 prisma/dev.db \"SELECT key, CASE WHEN value IS NULL OR value = '' THEN 'пусто ✅' WHEN LENGTH(value) > 100 THEN SUBSTR(value, 1, 100) || '...' ELSE value END as value, LENGTH(value) as length FROM SiteSetting WHERE key IN ('customJs', 'customCss', 'globalSchemaMarkup', 'homeSchemaMarkup') ORDER BY key;\""
echo ""
echo "# 2. Поиск falsh.org"
echo "sqlite3 prisma/dev.db \"SELECT key, id, '⚠️ FALSH.ORG НАЙДЕН!' as issue FROM SiteSetting WHERE key IN ('customJs', 'customCss', 'globalSchemaMarkup', 'homeSchemaMarkup') AND value LIKE '%falsh.org%';\""
echo ""
echo "# 3. Поиск редиректов"
echo "sqlite3 prisma/dev.db \"SELECT key, id, '⚠️ РЕДИРЕКТ НАЙДЕН!' as issue FROM SiteSetting WHERE key IN ('customJs', 'customCss', 'globalSchemaMarkup', 'homeSchemaMarkup') AND (value LIKE '%location.href%' OR value LIKE '%window.location%' OR value LIKE '%location.replace%');\""
echo ""
echo "# 4. Показать содержимое customJs (если есть)"
echo "sqlite3 prisma/dev.db \"SELECT value FROM SiteSetting WHERE key = 'customJs';\" | head -c 1000"
echo ""
echo "# 5. Если найдено вредоносное содержимое - очистить:"
echo "sqlite3 prisma/dev.db \"UPDATE SiteSetting SET value = '' WHERE key IN ('customJs', 'customCss', 'globalSchemaMarkup');\""
echo "pm2 restart doorhan-crimea"
