#!/usr/bin/env node

/**
 * Скрипт миграции для деплоя на сервер
 * 
 * Выполняет:
 * 1. Копирование локальной БД на сервер
 * 2. Обновление кода с git
 * 3. Сборку проекта
 * 4. Перезапуск PM2
 */

const { Client } = require('ssh2');
const { createReadStream, existsSync } = require('fs');
const { join } = require('path');
const winston = require('winston');

// Конфигурация сервера
const SERVER_CONFIG = {
  host: process.env.SSH_HOST || '195.66.27.66',
  username: process.env.SSH_USER || 'root',
  password: process.env.SSH_PASSWORD || '185p6Aa7XP6n',
  privateKey: process.env.SSH_PRIVATE_KEY ? require('fs').readFileSync(process.env.SSH_PRIVATE_KEY) : undefined,
  port: parseInt(process.env.SSH_PORT || '22'),
  // Настройки для стабильного соединения
  keepaliveInterval: 10000, // Отправлять keepalive каждые 10 секунд
  keepaliveCountMax: 10, // Максимум 10 попыток keepalive
  readyTimeout: 20000, // Таймаут подключения 20 секунд
  // Дополнительные настройки для стабильности
  algorithms: {
    kex: [
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521',
    ],
  },
};

// Пути
const SERVER_PROJECT_PATH = '/var/www/doorhan-crimea';
const LOCAL_DB_PATH = join(__dirname, 'prisma', 'dev.db');
const SERVER_DB_PATH = `${SERVER_PROJECT_PATH}/prisma/dev.db`;
const PM2_PROCESS_NAME = 'doorhan-crimea';

// Настройка логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'migrate' },
  transports: [
    new winston.transports.File({ 
      filename: 'migrate-error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'migrate.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ],
});

// Утилита для выполнения команд на сервере с retry логикой
async function executeCommand(conn, command, description, retries = 3, timeout = 300000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) {
        logger.warn(`Повторная попытка ${attempt}/${retries}: ${description}`);
        // Небольшая задержка перед повтором
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return await executeCommandOnce(conn, command, description, timeout);
    } catch (error) {
      logger.warn(`Попытка ${attempt}/${retries} не удалась: ${error.message}`);
      
      if (attempt === retries) {
        logger.error(`Все попытки исчерпаны для: ${description}`);
        throw error;
      }
      
      // Если ошибка связана с соединением, нужно переподключиться
      if (error.code === 'ECONNRESET' || 
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.message.includes('connection') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('CONNECTION_LOST')) {
        logger.warn('Обнаружен разрыв соединения, требуется переподключение...');
        throw new Error('CONNECTION_LOST');
      }
    }
  }
}

// Выполнение одной команды
function executeCommandOnce(conn, command, description, timeout = 300000) {
  return new Promise((resolve, reject) => {
    logger.info(`Выполняю: ${description}`);
    logger.debug(`Команда: ${command}`);
    
    // Проверка состояния соединения
    if (!conn || !conn.config) {
      const error = new Error('Соединение не установлено');
      error.code = 'ECONNRESET';
      return reject(error);
    }
    
    // Таймаут для команды
    const timeoutId = setTimeout(() => {
      logger.error(`Таймаут выполнения команды: ${description} (${timeout}ms)`);
      const error = new Error(`Таймаут выполнения команды: ${description}`);
      error.code = 'ETIMEDOUT';
      reject(error);
    }, timeout);
    
    // Переменные для отслеживания активности (объявляем заранее)
    let activityCheck = null;
    let onErrorHandler = null;
    
    // Обработчик разрыва соединения
    const onError = (err) => {
      clearTimeout(timeoutId);
      if (activityCheck) clearInterval(activityCheck);
      if (onErrorHandler) conn.removeListener('error', onErrorHandler);
      const error = new Error(`Разрыв соединения во время выполнения: ${err.message}`);
      error.code = err.code || 'ECONNRESET';
      error.originalError = err;
      reject(error);
    };
    
    onErrorHandler = onError;
    conn.once('error', onError);
    
    conn.exec(command, (err, stream) => {
      if (err) {
        clearTimeout(timeoutId);
        if (onErrorHandler) conn.removeListener('error', onErrorHandler);
        logger.error(`Ошибка выполнения команды: ${err.message}`, { error: err });
        const error = new Error(`Ошибка выполнения команды: ${err.message}`);
        error.code = err.code || 'EXEC_ERROR';
        return reject(error);
      }

      let stdout = '';
      let stderr = '';
      let lastActivity = Date.now();

      // Обновляем время последней активности при получении данных
      const updateActivity = () => {
        lastActivity = Date.now();
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        if (activityCheck) clearInterval(activityCheck);
        if (onErrorHandler) conn.removeListener('error', onErrorHandler);
      };

      stream.on('close', (code, signal) => {
        cleanup();
        
        if (code !== 0) {
          logger.error(`Команда завершилась с кодом ${code}`, { 
            command, 
            stdout, 
            stderr,
            signal 
          });
          return reject(new Error(`Команда завершилась с кодом ${code}: ${stderr || stdout}`));
        }
        
        logger.info(`Команда выполнена успешно: ${description}`);
        if (stdout) logger.debug(`Вывод: ${stdout.substring(0, 500)}...`); // Ограничиваем вывод
        resolve({ stdout, stderr, code });
      });

      stream.on('data', (data) => {
        updateActivity();
        stdout += data.toString();
        process.stdout.write(data);
      });

      stream.stderr.on('data', (data) => {
        updateActivity();
        stderr += data.toString();
        process.stderr.write(data);
      });

      stream.on('error', (err) => {
        cleanup();
        const error = new Error(`Ошибка потока команды: ${err.message}`);
        error.code = err.code || 'STREAM_ERROR';
        error.originalError = err;
        reject(error);
      });

      // Проверка активности каждые 30 секунд
      activityCheck = setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime > 60000) { // 1 минута без активности
          logger.warn(`Долгое время без активности (${Math.round(inactiveTime/1000)}s), команда все еще выполняется...`);
        }
      }, 30000);
    });
  });
}

// Копирование файла на сервер через SCP
function copyFileToServer(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    if (!existsSync(localPath)) {
      const error = new Error(`Локальный файл не найден: ${localPath}`);
      logger.error(error.message);
      return reject(error);
    }

    logger.info(`Копирую файл: ${localPath} -> ${remotePath}`);
    
    const sftp = conn.sftp((err, sftp) => {
      if (err) {
        logger.error(`Ошибка создания SFTP соединения: ${err.message}`, { error: err });
        return reject(err);
      }

      const readStream = createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);

      readStream.on('error', (err) => {
        logger.error(`Ошибка чтения файла: ${err.message}`, { error: err });
        reject(err);
      });

      writeStream.on('error', (err) => {
        logger.error(`Ошибка записи файла на сервер: ${err.message}`, { error: err });
        reject(err);
      });

      writeStream.on('close', () => {
        logger.info(`Файл успешно скопирован: ${remotePath}`);
        resolve();
      });

      readStream.pipe(writeStream);
    });
  });
}

// Создание и настройка SSH соединения
function createConnection() {
  const conn = new Client();
  
  // Обработка событий соединения
  conn.on('error', (err) => {
    logger.error(`Ошибка SSH соединения: ${err.message}`, { error: err });
  });
  
  // Логирование событий соединения
  conn.on('keyboard-interactive', () => {
    logger.debug('Требуется интерактивная аутентификация');
  });
  
  return conn;
}

// Основная функция миграции с переподключением
async function migrate() {
  let conn = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;
  
  logger.info('=== Начало миграции ===');
  logger.info(`Сервер: ${SERVER_CONFIG.host}`);
  logger.info(`Пользователь: ${SERVER_CONFIG.username}`);
  logger.info(`Проект: ${SERVER_PROJECT_PATH}`);

  const performMigration = async (connection) => {
    try {
      // Шаг 1: Копирование БД на сервер
      logger.info('--- Шаг 1: Копирование базы данных ---');
      await copyFileToServer(connection, LOCAL_DB_PATH, SERVER_DB_PATH);
      
      // Шаг 2: Обновление кода с git (принудительно)
      logger.info('--- Шаг 2: Обновление кода с git ---');
      const gitBranch = process.env.GIT_BRANCH || 'copy/main';
      
      // Сначала делаем fetch чтобы получить последние изменения
      await executeCommand(
        connection,
        `cd ${SERVER_PROJECT_PATH} && git fetch origin ${gitBranch}`,
        `Получение изменений с git (ветка: ${gitBranch})`,
        3,
        60000
      );
      
      // Затем делаем hard reset чтобы принудительно обновить до последней версии
      await executeCommand(
        connection,
        `cd ${SERVER_PROJECT_PATH} && git reset --hard origin/${gitBranch}`,
        `Принудительное обновление до последней версии`,
        3,
        30000
      );
      
      // Очищаем неотслеживаемые файлы (опционально, но может помочь)
      await executeCommand(
        connection,
        `cd ${SERVER_PROJECT_PATH} && git clean -fd`,
        'Очистка неотслеживаемых файлов',
        2,
        30000
      );
      
      // Шаг 3: Очистка кэша Next.js и node_modules для чистого билда
      logger.info('--- Шаг 3: Очистка кэша и старых файлов ---');
      await executeCommand(
        connection,
        `cd ${SERVER_PROJECT_PATH} && rm -rf .next node_modules/.cache`,
        'Очистка кэша Next.js',
        2,
        30000
      );
      
      // Шаг 4: Установка зависимостей (принудительно заново)
      logger.info('--- Шаг 4: Установка зависимостей ---');
      await executeCommand(
        connection,
        `cd ${SERVER_PROJECT_PATH} && npm ci --prefer-offline --no-audit`,
        'Установка зависимостей',
        2, // Меньше повторов, но больше таймаут
        600000 // 10 минут для npm ci
      );
      
        // Шаг 5: Генерация Prisma клиента
        logger.info('--- Шаг 5: Генерация Prisma клиента ---');
        await executeCommand(
          connection,
          `cd ${SERVER_PROJECT_PATH} && npx prisma generate`,
          'Генерация Prisma клиента',
          3,
          120000 // 2 минуты
        );
        
        // Шаг 6: Сборка проекта - длительная операция
        logger.info('--- Шаг 6: Сборка проекта ---');
        await executeCommand(
          connection,
          `cd ${SERVER_PROJECT_PATH} && npm run build`,
          'Сборка проекта',
          2,
          600000 // 10 минут для сборки
        );
        
        // Шаг 7: Перезапуск PM2
        logger.info('--- Шаг 7: Перезапуск PM2 ---');
      await executeCommand(
        connection,
        `pm2 restart ${PM2_PROCESS_NAME}`,
        `Перезапуск PM2 процесса: ${PM2_PROCESS_NAME}`,
        3,
        30000 // 30 секунд
      );
      
        // Проверка статуса PM2
        logger.info('--- Проверка статуса PM2 ---');
        await executeCommand(
          connection,
          `pm2 status ${PM2_PROCESS_NAME}`,
          'Проверка статуса PM2',
          3,
          30000
        );
        
        // Очистка логов PM2 (опционально)
        logger.info('--- Очистка старых логов PM2 ---');
        await executeCommand(
          connection,
          `pm2 flush ${PM2_PROCESS_NAME}`,
          'Очистка логов PM2',
          2,
          10000
        );
      
      logger.info('=== Миграция завершена успешно ===');
      return true;
      
    } catch (error) {
      if (error.message === 'CONNECTION_LOST' && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        logger.warn(`Попытка переподключения ${reconnectAttempts}/${maxReconnectAttempts}...`);
        
        if (connection) {
          connection.end();
        }
        
        // Переподключение
        return await reconnectAndRetry();
      }
      
      logger.error('Ошибка во время миграции', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  // Функция переподключения
  const reconnectAndRetry = async () => {
    return new Promise((resolve, reject) => {
      logger.info('Переподключаюсь к серверу...');
      const newConn = createConnection();
      
      newConn.on('ready', async () => {
        logger.info('SSH соединение восстановлено');
        try {
          await performMigration(newConn);
          newConn.end();
          resolve();
        } catch (error) {
          newConn.end();
          reject(error);
        }
      });
      
      newConn.on('error', (err) => {
        logger.error(`Ошибка переподключения: ${err.message}`, { error: err });
        reject(err);
      });
      
      newConn.connect(SERVER_CONFIG);
    });
  };

  // Первоначальное подключение
  return new Promise((resolve, reject) => {
    conn = createConnection();
    
    conn.on('ready', async () => {
      logger.info('SSH соединение установлено');
      
      try {
        await performMigration(conn);
        conn.end();
        resolve();
      } catch (error) {
        conn.end();
        reject(error);
      }
    });

    conn.on('error', (err) => {
      logger.error(`Ошибка SSH соединения: ${err.message}`, { error: err });
      reject(err);
    });

    // Подключение к серверу
    logger.info('Подключаюсь к серверу...');
    conn.connect(SERVER_CONFIG);
  });
}

// Обработка ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанное отклонение промиса', { reason, promise });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Необработанное исключение', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Запуск миграции
if (require.main === module) {
  migrate()
    .then(() => {
      logger.info('Миграция завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Миграция завершилась с ошибкой', { error: error.message });
      process.exit(1);
    });
}

module.exports = { migrate };

