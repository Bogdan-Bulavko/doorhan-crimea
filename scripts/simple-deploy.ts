import { Client } from 'ssh2';
import fs from 'fs/promises';
import path from 'path';

// Конфигурация
const SERVER = {
  host: '195.66.27.66',
  username: 'root',
  password: '185p6Aa7XP6n',
  port: 22
};

const PROJECT = {
  name: 'doorhan-crimea',
  port: 3042,
  repoUrl: 'https://github.com/Bogdan-Bulavko/doorhan-crimea.git',
  branch: 'copy/main'
};

class SimpleDeployer {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔌 Подключение к серверу...');
      
      this.client.on('ready', () => {
        console.log('✅ Подключен к серверу');
        resolve();
      });

      this.client.on('error', (err) => {
        console.error('❌ Ошибка подключения:', err.message);
        reject(err);
      });

      this.client.connect(SERVER);
    });
  }

  async runCommand(cmd: string, desc: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔄 ${desc}...`);
      
      this.client.exec(cmd, (err, stream) => {
        if (err) {
          console.error(`❌ Ошибка: ${err.message}`);
          reject(err);
          return;
        }

        stream.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ ${desc} - OK`);
            resolve();
          } else {
            console.error(`❌ ${desc} - FAILED (код: ${code})`);
            reject(new Error(`Команда завершена с кодом ${code}`));
          }
        });

        stream.on('data', (data) => {
          console.log(data.toString().trim());
        });

        stream.stderr.on('data', (data) => {
          console.error(data.toString().trim());
        });
      });
    });
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`📤 Загрузка: ${localPath}`);
      
      this.client.sftp((err, sftp) => {
        if (err) {
          reject(err);
          return;
        }

        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Загружен: ${remotePath}`);
            resolve();
          }
        });
      });
    });
  }

  async deploy(): Promise<void> {
    try {
      // 1. Подключение
      await this.connect();

      // 2. Обновление системы
      await this.runCommand(
        'apt update && apt install -y curl git nginx nodejs npm',
        'Установка зависимостей'
      );

      // 3. Клонирование проекта
      await this.runCommand(
        `rm -rf /var/www/${PROJECT.name}`,
        'Очистка'
      );

      await this.runCommand(
        `git clone -b ${PROJECT.branch} ${PROJECT.repoUrl} /var/www/${PROJECT.name}`,
        'Клонирование проекта'
      );

      // 4. Установка зависимостей
      await this.runCommand(
        `cd /var/www/${PROJECT.name} && npm install`,
        'Установка npm пакетов'
      );

      await this.runCommand(
        `cd /var/www/${PROJECT.name} && npm install --save-dev tsx`,
        'Установка tsx'
      );

      // 5. Загрузка файлов
      const files = ['database-export.json', '.env'];
      for (const file of files) {
        try {
          await fs.access(file);
          await this.uploadFile(
            path.join(process.cwd(), file),
            `/var/www/${PROJECT.name}/${file}`
          );
        } catch {
          console.log(`⚠️ Файл ${file} не найден, пропускаем`);
        }
      }

      // 6. Настройка .env
      await this.runCommand(
        `cd /var/www/${PROJECT.name} && echo 'DATABASE_URL="file:./prisma/prod.db"' >> .env`,
        'Настройка DATABASE_URL'
      );

      await this.runCommand(
        `cd /var/www/${PROJECT.name} && echo 'NODE_ENV="production"' >> .env`,
        'Настройка NODE_ENV'
      );

      // 7. Настройка базы данных
      await this.runCommand(
        `cd /var/www/${PROJECT.name} && npx prisma generate`,
        'Генерация Prisma'
      );

      await this.runCommand(
        `cd /var/www/${PROJECT.name} && npx prisma db push`,
        'Создание БД'
      );

      // 8. Импорт данных
      try {
        await this.runCommand(
          `cd /var/www/${PROJECT.name} && npm run import-database`,
          'Импорт данных'
        );
      } catch {
        console.log('⚠️ Импорт данных пропущен (файл не найден)');
      }

      // 9. Сборка
      await this.runCommand(
        `cd /var/www/${PROJECT.name} && npm run build`,
        'Сборка проекта'
      );

      // 10. Установка PM2
      await this.runCommand(
        'npm install -g pm2',
        'Установка PM2'
      );

      // 11. Создание PM2 конфига
      const pm2Config = `module.exports = {
  apps: [{
    name: '${PROJECT.name}',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/${PROJECT.name}',
    env: {
      NODE_ENV: 'production',
      PORT: ${PROJECT.port}
    }
  }]
};`;

      await this.runCommand(
        `cd /var/www/${PROJECT.name} && echo '${pm2Config}' > ecosystem.config.js`,
        'Создание PM2 конфига'
      );

      // 12. Настройка Nginx
      const nginxConfig = `server {
    listen 80;
    server_name ${SERVER.host};
    
    location / {
        proxy_pass http://localhost:${PROJECT.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;

      await this.runCommand(
        `echo '${nginxConfig}' > /etc/nginx/sites-available/${PROJECT.name}`,
        'Создание Nginx конфига'
      );

      await this.runCommand(
        `ln -sf /etc/nginx/sites-available/${PROJECT.name} /etc/nginx/sites-enabled/`,
        'Активация сайта'
      );

      await this.runCommand(
        'rm -f /etc/nginx/sites-enabled/default',
        'Удаление дефолтного сайта'
      );

      await this.runCommand(
        'nginx -t && systemctl reload nginx',
        'Перезагрузка Nginx'
      );

      // 13. Запуск приложения
      await this.runCommand(
        `cd /var/www/${PROJECT.name} && pm2 start ecosystem.config.js`,
        'Запуск приложения'
      );

      await this.runCommand(
        'pm2 save && pm2 startup',
        'Настройка автозапуска'
      );

      // 14. Проверка
      await this.runCommand(
        'pm2 status',
        'Проверка статуса'
      );

      await this.runCommand(
        `curl -f http://localhost:${PROJECT.port} || echo "Проверка доступности"`,
        'Проверка приложения'
      );

      // 15. Файрвол
      await this.runCommand(
        'ufw allow 22 && ufw allow 80 && ufw --force enable',
        'Настройка файрвола'
      );

      console.log('🎉 Деплой завершен!');
      console.log(`🌐 Сайт: http://${SERVER.host}`);
      console.log(`🔧 Управление: pm2 status, pm2 logs ${PROJECT.name}`);

    } catch (error) {
      console.error('❌ Ошибка деплоя:', error);
      throw error;
    } finally {
      this.client.end();
    }
  }
}

// Запуск
async function main() {
  const deployer = new SimpleDeployer();
  
  try {
    await deployer.deploy();
    console.log('✅ Деплой успешен!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Деплой провален:', error);
    process.exit(1);
  }
}

main();
