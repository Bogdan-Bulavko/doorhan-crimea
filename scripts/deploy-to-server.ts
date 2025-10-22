import { Client } from 'ssh2';
import fs from 'fs/promises';
import path from 'path';
import winston from 'winston';

// Настройка логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'deploy.log' })
  ]
});

// Конфигурация сервера
const SERVER_CONFIG = {
  host: '195.66.27.66',
  username: 'root',
  password: '185p6Aa7XP6n',
  port: 22
};

const PROJECT_CONFIG = {
  name: 'doorhan-crimea',
  port: 3042,
  domain: '195.66.27.66',
  repoUrl: 'https://github.com/Bogdan-Bulavko/doorhan-crimea.git',
  branch: 'copy/main'
};

class ServerDeployer {
  private client: Client;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info('🔌 Подключение к серверу...');
      
      this.client.on('ready', () => {
        logger.info('✅ Подключение к серверу установлено');
        this.isConnected = true;
        resolve();
      });

      this.client.on('error', (err) => {
        logger.error('❌ Ошибка подключения:', err.message);
        reject(err);
      });

      this.client.connect(SERVER_CONFIG);
    });
  }

  async executeCommand(command: string, description: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Не подключен к серверу'));
        return;
      }

      logger.info(`🔄 ${description}...`);
      
      this.client.exec(command, (err, stream) => {
        if (err) {
          logger.error(`❌ Ошибка выполнения команды: ${err.message}`);
          reject(err);
          return;
        }

        let output = '';
        let errorOutput = '';

        stream.on('close', (code: number) => {
          if (code === 0) {
            logger.info(`✅ ${description} завершено успешно`);
            resolve(output);
          } else {
            logger.error(`❌ ${description} завершено с ошибкой (код: ${code})`);
            logger.error(`Ошибка: ${errorOutput}`);
            reject(new Error(`Команда завершена с кодом ${code}: ${errorOutput}`));
          }
        });

        stream.on('data', (data: Buffer) => {
          const dataStr = data.toString();
          output += dataStr;
          logger.info(dataStr.trim());
        });

        stream.stderr.on('data', (data: Buffer) => {
          const errorStr = data.toString();
          errorOutput += errorStr;
          logger.error(errorStr.trim());
        });
      });
    });
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Не подключен к серверу'));
        return;
      }

      logger.info(`📤 Загрузка файла: ${localPath} -> ${remotePath}`);
      
      this.client.sftp((err, sftp) => {
        if (err) {
          logger.error('❌ Ошибка SFTP:', err.message);
          reject(err);
          return;
        }

        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) {
            logger.error(`❌ Ошибка загрузки файла: ${err.message}`);
            reject(err);
          } else {
            logger.info(`✅ Файл загружен: ${remotePath}`);
            resolve();
          }
        });
      });
    });
  }

  async deploy(): Promise<void> {
    try {
      // 1. Подключение к серверу
      await this.connect();

      // 2. Обновление системы и установка зависимостей
      logger.info('🚀 Начало деплоя...');
      
      await this.executeCommand(
        'apt update && apt upgrade -y',
        'Обновление системы'
      );

      await this.executeCommand(
        'apt install -y curl git nginx',
        'Установка базовых зависимостей'
      );

      // Установка Node.js через NodeSource
      await this.executeCommand(
        'curl -fsSL https://deb.nodesource.com/setup_18.x | bash -',
        'Добавление NodeSource репозитория'
      );

      await this.executeCommand(
        'apt install -y nodejs',
        'Установка Node.js 18.x'
      );

      // 3. Клонирование репозитория
      await this.executeCommand(
        `rm -rf /var/www/${PROJECT_CONFIG.name}`,
        'Очистка старой версии'
      );

      await this.executeCommand(
        `git clone -b ${PROJECT_CONFIG.branch} ${PROJECT_CONFIG.repoUrl} /var/www/${PROJECT_CONFIG.name}`,
        'Клонирование репозитория'
      );

      // 4. Установка зависимостей проекта
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && npm install`,
        'Установка зависимостей проекта'
      );

      // 5. Установка tsx для выполнения скриптов
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && npm install --save-dev tsx`,
        'Установка tsx'
      );

      // 6. Экспорт базы данных с локальной машины
      logger.info('📊 Экспорт базы данных с локальной машины...');
      await this.executeCommand(
        'npm run export-database',
        'Экспорт базы данных'
      );

      // 7. Загрузка файлов на сервер
      const localFiles = [
        'database-export.json',
        '.env'
      ];

      for (const file of localFiles) {
        if (await this.fileExists(file)) {
          await this.uploadFile(
            path.join(process.cwd(), file),
            `/var/www/${PROJECT_CONFIG.name}/${file}`
          );
        } else {
          logger.warn(`⚠️ Файл ${file} не найден, пропускаем`);
        }
      }

      // 8. Настройка переменных окружения на сервере
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && echo 'DATABASE_URL="file:./prisma/prod.db"' >> .env`,
        'Настройка DATABASE_URL'
      );

      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && echo 'NODE_ENV="production"' >> .env`,
        'Настройка NODE_ENV'
      );

      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && echo 'DEPLOY_TARGET="production"' >> .env`,
        'Настройка DEPLOY_TARGET'
      );

      // 9. Генерация Prisma клиента
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && npx prisma generate`,
        'Генерация Prisma клиента'
      );

      // 10. Создание базы данных
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && npx prisma db push`,
        'Создание базы данных'
      );

      // 11. Импорт данных
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && npm run import-database`,
        'Импорт данных'
      );

      // 12. Сборка проекта
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && npm run build`,
        'Сборка проекта'
      );

      // 13. Настройка PM2 для управления процессом
      await this.executeCommand(
        'npm install -g pm2',
        'Установка PM2'
      );

      // 14. Создание конфигурации PM2
      const pm2Config = {
        apps: [{
          name: PROJECT_CONFIG.name,
          script: 'npm',
          args: 'start',
          cwd: `/var/www/${PROJECT_CONFIG.name}`,
          instances: 1,
          exec_mode: 'fork',
          env: {
            NODE_ENV: 'production',
            PORT: PROJECT_CONFIG.port
          }
        }]
      };

      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && echo '${JSON.stringify(pm2Config, null, 2)}' > ecosystem.config.js`,
        'Создание конфигурации PM2'
      );

      // 15. Настройка Nginx
      const nginxConfig = `
server {
    listen 80;
    server_name ${PROJECT_CONFIG.domain};

    location / {
        proxy_pass http://localhost:${PROJECT_CONFIG.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
      `;

      await this.executeCommand(
        `echo '${nginxConfig}' > /etc/nginx/sites-available/${PROJECT_CONFIG.name}`,
        'Создание конфигурации Nginx'
      );

      await this.executeCommand(
        `ln -sf /etc/nginx/sites-available/${PROJECT_CONFIG.name} /etc/nginx/sites-enabled/`,
        'Активация сайта в Nginx'
      );

      await this.executeCommand(
        'rm -f /etc/nginx/sites-enabled/default',
        'Удаление дефолтного сайта'
      );

      await this.executeCommand(
        'nginx -t && systemctl reload nginx',
        'Проверка и перезагрузка Nginx'
      );

      // 16. Запуск приложения
      await this.executeCommand(
        `cd /var/www/${PROJECT_CONFIG.name} && pm2 start ecosystem.config.js`,
        'Запуск приложения через PM2'
      );

      await this.executeCommand(
        'pm2 save && pm2 startup',
        'Настройка автозапуска PM2'
      );

      // 17. Проверка статуса
      await this.executeCommand(
        'pm2 status',
        'Проверка статуса приложения'
      );

      await this.executeCommand(
        `curl -f http://localhost:${PROJECT_CONFIG.port} || echo "Приложение не отвечает"`,
        'Проверка доступности приложения'
      );

      // 18. Настройка файрвола
      await this.executeCommand(
        'ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable',
        'Настройка файрвола'
      );

      logger.info('🎉 Деплой завершен успешно!');
      logger.info(`🌐 Ваш сайт доступен по адресу: http://${PROJECT_CONFIG.domain}`);
      logger.info(`🔧 Управление приложением: pm2 status, pm2 logs ${PROJECT_CONFIG.name}`);

    } catch (error) {
      logger.error('❌ Ошибка при деплое:', error);
      throw error;
    } finally {
      this.client.end();
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Запуск деплоя
async function main() {
  const deployer = new ServerDeployer();
  
  try {
    await deployer.deploy();
    logger.info('✅ Деплой завершен успешно!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Деплой завершился с ошибкой:', error);
    process.exit(1);
  }
}

main();
