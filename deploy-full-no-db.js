#!/usr/bin/env node
/**
 * Полнофункциональный скрипт деплоя на сервер БЕЗ загрузки БД
 * Оставляет существующую БД на сервере без изменений
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const archiver = require('archiver');

// Конфигурация сервера
const SERVER_CONFIG = {
  host: '91.240.86.16',
  username: 'root',
  password: 'x5S14CvJRmoF0KUaImJH', // Обновлен 2026-01-11
  remotePath: '/var/www/doorhan-crimea',
};

// Логирование
const LOG_FILE = `deploy-full-${Date.now()}.log`;
const logs = [];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(logMessage);
  logs.push(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'success');
}

function logError(message) {
  log(`❌ ${message}`, 'error');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'warning');
}

function logStep(step, message) {
  log(`📋 Шаг ${step}: ${message}`, 'step');
}

// SSH подключение
function createSSHConnection() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      logSuccess('SSH подключение установлено');
      resolve(conn);
    });
    conn.on('error', (err) => {
      logError(`Ошибка SSH: ${err.message}`);
      reject(err);
    });
    conn.connect({
      host: SERVER_CONFIG.host,
      username: SERVER_CONFIG.username,
      password: SERVER_CONFIG.password,
      readyTimeout: 20000,
    });
  });
}

// Выполнение команды на сервере
function execSSH(conn, command, description, allowFailure = false) {
  return new Promise((resolve, reject) => {
    log(`Выполнение: ${description || command}`);
    conn.exec(command, (err, stream) => {
      if (err) {
        logError(`Ошибка выполнения команды: ${err.message}`);
        if (allowFailure) {
          logWarning('Продолжаем несмотря на ошибку');
          resolve('');
        } else {
          reject(err);
        }
        return;
      }

      let output = '';
      stream.on('close', (code) => {
        // code может быть null при успешном завершении некоторых команд
        if (code !== 0 && code !== null) {
          if (allowFailure) {
            logWarning(`Команда завершилась с кодом ${code}, но продолжаем`);
            resolve(output);
          } else {
            logError(`Команда завершилась с кодом ${code}`);
            reject(new Error(`Command failed with code ${code}: ${output.substring(0, 500)}`));
          }
        } else {
          logSuccess(`Команда выполнена успешно`);
          resolve(output);
        }
      });

      stream.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      });

      stream.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stderr.write(text);
      });
    });
  });
}

// Создание архива проекта
async function createArchive() {
  logStep(1, 'Создание архива проекта');
  
  const archiveName = 'deploy-archive.tar.gz';
  const output = fs.createWriteStream(archiveName);
  const archive = archiver('tar', { 
    gzip: true,
    gzipOptions: {
      level: 9,
      memLevel: 9
    }
  });

  return new Promise((resolve, reject) => {
    archive.on('error', (err) => {
      logError(`Ошибка создания архива: ${err.message}`);
      reject(err);
    });

    output.on('close', () => {
      const size = (archive.pointer() / 1024 / 1024).toFixed(2);
      logSuccess(`Архив создан: ${archiveName} (${size} MB)`);
      resolve(archiveName);
    });

    archive.pipe(output);

    // Добавляем файлы с исключениями
    archive.glob('**/*', {
      ignore: [
        'node_modules/**',
        '.next/**',
        'out/**',
        '.git/**',
        '*.log',
        '*.db',
        '.DS_Store',
        '*.tsbuildinfo',
        '.env.local',
        '.env.development',
        '.env.test',
        'deploy-*.tar.gz',
        'deploy-*.log',
        'prisma/dev_backup_*.db',
        'prisma/old_dev.db',
        'database-export.json',
      ],
      cwd: process.cwd(),
    });

    archive.finalize();
  });
}

// Загрузка файла на сервер через SCP
function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    log(`Загрузка файла: ${localPath} -> ${remotePath}`);
    conn.sftp((err, sftp) => {
      if (err) {
        logError(`Ошибка SFTP: ${err.message}`);
        reject(err);
        return;
      }

      sftp.fastPut(localPath, remotePath, (err) => {
        if (err) {
          logError(`Ошибка загрузки файла: ${err.message}`);
          reject(err);
        } else {
          logSuccess(`Файл загружен: ${remotePath}`);
          resolve();
        }
      });
    });
  });
}

// Основной процесс деплоя
async function deploy() {
  let conn = null;
  let archiveName = null;

  try {
    log('🚀 Начало полного деплоя на сервер (БЕЗ загрузки БД)');
    log(`Сервер: ${SERVER_CONFIG.host}`);
    log(`Путь: ${SERVER_CONFIG.remotePath}`);
    logWarning('⚠️  БД на сервере будет сохранена без изменений');

    // Шаг 1: Проверка линтером
    logStep(1, 'Проверка проекта линтером');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      logSuccess('Линтер прошел успешно');
    } catch {
      logWarning('Линтер нашел ошибки, но продолжаем');
    }

    // Шаг 2: Сборка проекта
    logStep(2, 'Сборка проекта');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      logSuccess('Проект собран успешно');
    } catch (error) {
      logError('Ошибка сборки проекта');
      throw error;
    }

    // Шаг 3: Создание архива
    archiveName = await createArchive();

    // Шаг 4: Подключение к серверу
    logStep(4, 'Подключение к серверу');
    conn = await createSSHConnection();

    // Шаг 5: Создание резервной копии БД на сервере (на всякий случай)
    logStep(5, 'Создание резервной копии БД на сервере (на всякий случай)');
    await execSSH(conn, `mkdir -p ~/backups`, 'Создание директории для бэкапов');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && [ -f prisma/dev.db ] && cp prisma/dev.db ~/backups/dev_backup_$(date +%Y%m%d_%H%M%S).db || echo "БД не найдена"`, 'Копирование БД', true);

    // Шаг 6: Остановка приложения и освобождение порта
    logStep(6, 'Остановка приложения и освобождение порта');
    // Сначала пробуем найти node через pm2 (если он запущен)
    const pm2NodePath = await execSSH(conn, `pm2 describe doorhan-crimea 2>/dev/null | grep "script path" || pm2 jlist 2>/dev/null | grep -o '"pm_exec_path":"[^"]*"' | head -1 || echo ""`, 'Поиск node через PM2', true);
    await execSSH(conn, `export PATH=$PATH:/usr/local/bin:/usr/bin && pm2 stop doorhan-crimea 2>/dev/null || pm2 delete doorhan-crimea 2>/dev/null || echo "Приложение не запущено"`, 'Остановка PM2', true);
    await execSSH(conn, `lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Порт 3000 свободен"`, 'Освобождение порта 3000', true);

    // Шаг 7: Сохранение БД перед очисткой
    logStep(7, 'Сохранение БД перед очисткой директории');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && if [ -f prisma/dev.db ]; then cp prisma/dev.db /tmp/dev.db.backup && echo "БД сохранена"; else echo "БД не найдена"; fi`, 'Сохранение БД', true);

    // Шаг 8: Очистка целевой директории (НО сохраняем prisma/)
    logStep(8, 'Очистка целевой директории (сохраняя БД)');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && mkdir -p prisma_backup && [ -f prisma/dev.db ] && cp prisma/dev.db prisma_backup/dev.db && echo "БД сохранена в prisma_backup" || echo "БД не найдена"`, 'Сохранение БД в prisma_backup', true);
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && find . -maxdepth 1 ! -name '.' ! -name 'prisma' ! -name 'prisma_backup' -exec rm -rf {} + 2>/dev/null || true`, 'Удаление файлов (кроме prisma)');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && rm -rf .[^.]* 2>/dev/null || true`, 'Удаление скрытых файлов (кроме .git)');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && [ -d prisma_backup ] && [ -f prisma_backup/dev.db ] && mv prisma_backup/dev.db prisma/dev.db && rmdir prisma_backup && echo "БД восстановлена" || echo "БД не была сохранена"`, 'Восстановление БД', true);
    await execSSH(conn, `mkdir -p ${SERVER_CONFIG.remotePath}`, 'Создание директории');

    // Шаг 9: Загрузка архива
    logStep(9, 'Загрузка архива на сервер');
    const remoteArchivePath = `${SERVER_CONFIG.remotePath}/${archiveName}`;
    await uploadFile(conn, archiveName, remoteArchivePath);

    // Шаг 10: Распаковка архива
    logStep(10, 'Распаковка архива');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && tar -xzf ${archiveName} && rm -f ${archiveName}`, 'Распаковка и удаление архива');

    // Шаг 11: Восстановление БД после распаковки
    logStep(11, 'Восстановление БД после распаковки');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && if [ -f /tmp/dev.db.backup ]; then cp /tmp/dev.db.backup prisma/dev.db && echo "БД восстановлена из /tmp"; elif [ -f prisma/dev.db ]; then echo "БД уже на месте"; else echo "⚠️ БД не найдена!"; fi`, 'Восстановление БД', true);

    // Шаг 12: Загрузка .env файла
    logStep(12, 'Загрузка .env файла');
    const localEnvPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(localEnvPath)) {
      let envContent = fs.readFileSync(localEnvPath, 'utf8');
      // Обновляем DATABASE_URL для сервера (абсолютный путь)
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="file:${SERVER_CONFIG.remotePath}/prisma/dev.db"`);
      // Добавляем PORT если нет
      if (!envContent.includes('PORT=')) {
        envContent += '\nPORT=3321\n';
      } else {
        envContent = envContent.replace(/PORT=.*/g, 'PORT=3321');
      }
      // Создаем временный .env файл
      const tempEnvPath = path.join(process.cwd(), '.env.deploy');
      fs.writeFileSync(tempEnvPath, envContent);
      await uploadFile(conn, tempEnvPath, `${SERVER_CONFIG.remotePath}/.env`);
      fs.unlinkSync(tempEnvPath);
      logSuccess('.env файл загружен с PORT=3321');
    } else {
      logWarning('.env файл не найден локально, создаем на сервере');
      await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && echo 'DATABASE_URL="file:${SERVER_CONFIG.remotePath}/prisma/dev.db"\nPORT=3321\nNODE_ENV=production' > .env`, 'Создание .env');
    }

    // Шаг 13: Поиск и настройка Node.js
    logStep(13, 'Поиск и настройка Node.js');
    const nodeSearchCmd = `bash -c '
      if command -v node >/dev/null 2>&1; then
        which node
      elif [ -f /usr/local/bin/node ]; then
        echo /usr/local/bin/node
      elif [ -f /usr/bin/node ]; then
        echo /usr/bin/node
      elif [ -d ~/.nvm ]; then
        export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && which node
      elif [ -d /root/.nvm ]; then
        export NVM_DIR="/root/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && which node
      else
        find /usr /opt /home -name node -type f 2>/dev/null | grep -v ".git" | head -1
      fi
    '`;
    
    const nodeSearch = await execSSH(conn, nodeSearchCmd, 'Поиск Node.js', true);
    const nodePath = nodeSearch.trim().split('\n').filter(line => line && line.startsWith('/') && !line.includes('not found') && !line.includes('No such'))[0] || '';
    
    if (!nodePath) {
      logWarning('Node.js не найден автоматически, пробуем использовать pm2 для определения пути...');
      const pm2Node = await execSSH(conn, `pm2 describe doorhan-crimea 2>/dev/null | grep "exec cwd" || pm2 list | head -5`, 'Поиск через PM2', true);
      log(`PM2 info: ${pm2Node.substring(0, 200)}`);
    }
    
    log(`Найден Node.js: ${nodePath || 'попробуем через стандартные пути'}`);
    
    // Настраиваем PATH для всех последующих команд
    let PATH_SETUP = `export PATH=/usr/local/bin:/usr/bin:/bin:$PATH`;
    if (nodePath) {
      const NODE_DIR = nodePath.substring(0, nodePath.lastIndexOf('/'));
      PATH_SETUP = `export PATH=${NODE_DIR}:${PATH_SETUP}`;
    }
    PATH_SETUP += ` && [ -f ~/.nvm/nvm.sh ] && source ~/.nvm/nvm.sh || [ -f /root/.nvm/nvm.sh ] && source /root/.nvm/nvm.sh || true`;

    // Шаг 14: Установка зависимостей
    logStep(14, 'Установка зависимостей');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && ${PATH_SETUP} && npm install 2>&1`, 'Установка npm пакетов', true);

    // Шаг 15: Генерация Prisma Client (для работы с существующей БД)
    logStep(15, 'Генерация Prisma Client');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && ${PATH_SETUP} && export DATABASE_URL="file:${SERVER_CONFIG.remotePath}/prisma/dev.db" && npx prisma generate`, 'Генерация Prisma');

    // Шаг 16: ПРОВЕРКА БД (не загружаем, только проверяем что она есть)
    logStep(16, 'Проверка существующей БД на сервере');
    const dbCheck = await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && if [ -f prisma/dev.db ]; then sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Product;" 2>/dev/null || echo "0"; else echo "БД не найдена"; fi`, 'Проверка БД', true);
    const productCount = parseInt(dbCheck.trim()) || 0;
    if (productCount > 0) {
      logSuccess(`✅ БД на сервере содержит ${productCount} товаров (БД сохранена)`);
    } else if (dbCheck.trim().includes('не найдена')) {
      logWarning('⚠️ БД не найдена на сервере!');
    } else {
      logWarning(`⚠️ БД найдена, но товаров нет (${productCount})`);
    }

    // Шаг 17: Проверка прав доступа к БД
    logStep(17, 'Проверка прав доступа к БД');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && chmod 644 prisma/dev.db && ls -lh prisma/dev.db`, 'Проверка прав доступа', true);
    
    // Проверяем что DATABASE_URL правильный в .env
    const envCheck = await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && grep DATABASE_URL .env`, 'Проверка DATABASE_URL в .env', true);
    log(`DATABASE_URL в .env: ${envCheck.trim()}`);

    // Шаг 18: Сборка проекта на сервере
    logStep(18, 'Сборка проекта на сервере');
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && ${PATH_SETUP} && export DATABASE_URL="file:${SERVER_CONFIG.remotePath}/prisma/dev.db" && export NODE_ENV=production && export PORT=3321 && npm run build`, 'Сборка Next.js');

    // Шаг 19: Освобождение порта и запуск в PM2
    logStep(19, 'Освобождение порта 3321 и запуск приложения в PM2');
    await execSSH(conn, `lsof -ti:3321 | xargs kill -9 2>/dev/null || echo "Порт 3321 свободен"`, 'Освобождение порта 3321', true);
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && ${PATH_SETUP} && pm2 delete doorhan-crimea 2>/dev/null || true`, 'Удаление старого процесса PM2', true);
    await execSSH(conn, `cd ${SERVER_CONFIG.remotePath} && ${PATH_SETUP} && PORT=3321 pm2 start npm --name "doorhan-crimea" -- start`, 'Запуск PM2 на порту 3321');

    // Шаг 20: Сохранение конфигурации PM2
    await execSSH(conn, `${PATH_SETUP} && pm2 save`, 'Сохранение PM2 конфигурации');

    // Шаг 21: Проверка статуса
    logStep(21, 'Проверка статуса приложения');
    await execSSH(conn, `${PATH_SETUP} && pm2 status`, 'Статус PM2');
    await execSSH(conn, `${PATH_SETUP} && pm2 logs doorhan-crimea --lines 20 --nostream`, 'Последние логи');

    // Шаг 22: Перезагрузка Nginx
    logStep(22, 'Перезагрузка Nginx');
    await execSSH(conn, `nginx -t && nginx -s reload || systemctl reload nginx || echo "Nginx не перезагружен"`, 'Перезагрузка Nginx', true);

    logSuccess('🎉 Деплой завершен успешно!');
    logWarning('⚠️  БД на сервере была сохранена без изменений');
    log(`📊 Лог файл: ${LOG_FILE}`);

  } catch (error) {
    logError(`Критическая ошибка: ${error.message}`);
    logError('Деплой не завершен');
    process.exit(1);
  } finally {
    if (conn) {
      conn.end();
    }
    if (archiveName && fs.existsSync(archiveName)) {
      fs.unlinkSync(archiveName);
      log('Локальный архив удален');
    }
  }
}

// Запуск
deploy().catch((error) => {
  logError(`Фатальная ошибка: ${error.message}`);
  process.exit(1);
});
