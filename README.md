# VPN Configuration Manager for Sing-box

Система для автоматизации создания VPN конфигураций через панели 3x-ui.

## Возможности

- Автоматическое создание клиентов на московском и немецком серверах 3x-ui
- Генерация конфигураций для iOS, Android и Windows
- Веб-интерфейс для управления клиентами
- Прямые ссылки на конфигурации (например: https://config.test-internet.ru/client-ios.json)
- Автоматическая маршрутизация трафика через промежуточный сервер

## Установка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd ui-sing-box
```

### 2. Настройка переменных окружения
Отредактируйте файл `.env`:
```env
# Moscow 3x-ui panel
MOSCOW_URL=https://moscow.grozny.site:8181/NeoGKy05wFkIoW7
MOSCOW_LOGIN=your_login
MOSCOW_PASSWORD=your_password

# Germany 3x-ui panel  
GERMANY_URL=https://de.grozny.site:61866/m5xiWJ4rsGSf9vV
GERMANY_LOGIN=your_login
GERMANY_PASSWORD=your_password

# Server settings
PORT=3001
NODE_ENV=production
```

### 3. Установка зависимостей

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

## Запуск

### Режим разработки

Backend:
```bash
cd backend
npm run dev
```

Frontend (в новом терминале):
```bash
cd frontend
npm start
```

### Production режим

Backend:
```bash
cd backend
npm start
```

Frontend - сначала собрать:
```bash
cd frontend
npm run build
```

## Использование

1. Откройте браузер и перейдите на http://localhost:3000
2. В форме создания клиента:
   - Введите имя клиента
   - Выберите платформу (iOS/Android/Windows)
   - Нажмите "Create Client"
3. Система автоматически:
   - Создаст клиентов на обоих серверах 3x-ui
   - Сгенерирует конфигурацию
   - Предоставит прямую ссылку на конфиг

## Структура проекта

```
ui-sing-box/
├── backend/
│   ├── src/
│   │   ├── api/          # API endpoints
│   │   ├── services/     # Бизнес-логика
│   │   ├── templates/    # Шаблоны конфигов
│   │   ├── models/       # База данных
│   │   └── index.js      # Входная точка
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── services/     # API клиент
│   │   └── App.js        # Главный компонент
│   └── package.json
├── configs/              # Сохраненные конфиги
├── public-configs/       # Публичные конфиги
└── .env                  # Настройки

```

## Nginx конфигурация для публичного доступа

Для доступа к конфигам по адресу https://config.test-internet.ru/ добавьте в nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name config.test-internet.ru;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001/api/configs/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## API Endpoints

### Клиенты
- `POST /api/clients/create` - Создать нового клиента
- `GET /api/clients/list` - Список всех клиентов
- `GET /api/clients/:name` - Информация о клиенте
- `DELETE /api/clients/:name` - Удалить клиента
- `GET /api/clients/status/servers` - Статус серверов

### Конфигурации
- `GET /api/configs` - Список конфигураций
- `GET /api/configs/:fileName` - Получить конфиг
- `PUT /api/configs/:fileName` - Обновить конфиг
- `DELETE /api/configs/:fileName` - Удалить конфиг

## Безопасность

- Используйте HTTPS в production
- Храните credentials в переменных окружения
- Ограничьте доступ к API через firewall
- Регулярно обновляйте зависимости

## Поддержка

При возникновении проблем проверьте:
1. Доступность серверов 3x-ui
2. Правильность credentials в .env
3. Логи backend сервера
4. Сетевые подключения