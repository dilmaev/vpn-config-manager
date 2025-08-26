# VPN Configuration Manager for Sing-box

Автоматизированная система управления VPN конфигурациями через панели 3x-ui с веб-интерфейсом.

## 🚀 Быстрый старт

См. [QUICK_START.md](QUICK_START.md) для быстрой установки на Ubuntu Server.

## ✨ Возможности

- **Автоматизация**: Создание клиентов на нескольких 3x-ui панелях одновременно
- **Мультиплатформенность**: Генерация конфигураций для iOS, Android и Windows
- **Веб-интерфейс**: Удобная админ-панель для управления клиентами
- **Прямые ссылки**: Доступ к конфигам по URL (например: `https://config.test-internet.ru/client-ios.json`)
- **Цепочка маршрутизации**: Россия → Москва → Германия с автоматической настройкой

## 📦 Установка на сервер

### Вариант 1: Автоматическая установка (рекомендуется)

```bash
# Загрузка на сервер
git clone https://github.com/dilmaev/vpn-config-manager.git
cd vpn-config-manager

# Запуск установщика
chmod +x install.sh
sudo ./install.sh

# Настройка credentials
nano /home/vpn-config/.env
```

### Вариант 2: Ручная установка

См. раздел "Разработка" ниже.

## 🔧 Конфигурация

### Настройка .env файла

```env
# Moscow 3x-ui panel
MOSCOW_URL=https://your-moscow-server.com:8181/path
MOSCOW_LOGIN=your_login
MOSCOW_PASSWORD=your_password

# Germany 3x-ui panel  
GERMANY_URL=https://your-germany-server.com:61866/path
GERMANY_LOGIN=your_login
GERMANY_PASSWORD=your_password

# Server settings
PORT=3001
NODE_ENV=production
```

### Настройка Nginx

```bash
# Копирование готового конфига
cp /home/vpn-config/nginx-site.conf /etc/nginx/sites-available/your-domain.conf
ln -sf /etc/nginx/sites-available/your-domain.conf /etc/nginx/sites-enabled/

# Проверка и перезагрузка
nginx -t
systemctl reload nginx
```

## 💻 Использование

### Админ-панель
- URL: `https://your-domain.com/admin`
- Создание клиентов с выбором платформы
- Просмотр списка существующих клиентов
- Мониторинг статуса серверов

### Прямые ссылки на конфиги
- iOS: `https://your-domain.com/client-ios.json`
- Android: `https://your-domain.com/client-android.json`
- Windows: `https://your-domain.com/client-windows.json`

## 🛠 Управление

### Проверка статуса
```bash
pm2 status
pm2 logs
```

### Перезапуск
```bash
pm2 restart all
```

### Обновление
```bash
cd /home/vpn-config
git pull
sudo ./install.sh
```

## 📁 Структура проекта

```
vpn-config-manager/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── api/         # REST API endpoints
│   │   ├── services/    # Бизнес-логика и интеграции
│   │   ├── templates/   # Шаблоны sing-box конфигов
│   │   └── models/      # SQLite база данных
│   └── package.json
├── frontend/            # React приложение
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   └── services/    # API клиент
│   └── package.json
├── configs/             # Генерируемые конфигурации
├── install.sh           # Универсальный установщик
└── .env.example         # Пример настроек
```

## 🔐 Безопасность

- ✅ HTTPS для всех соединений
- ✅ Credentials в переменных окружения
- ✅ Ограничение доступа через firewall
- ✅ Изоляция процессов через PM2
- ✅ Скрытие корневого URL (404)

## 🚧 Разработка

### Локальный запуск

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

### API Endpoints

**Клиенты:**
- `POST /api/clients/create` - Создание клиента
- `GET /api/clients/list` - Список клиентов
- `DELETE /api/clients/:name` - Удаление
- `GET /api/clients/status/servers` - Статус серверов

**Конфигурации:**
- `GET /api/configs` - Список конфигов
- `GET /api/configs/:fileName` - Получить конфиг

## 📝 Лицензия

MIT

## 🤝 Поддержка

При проблемах проверьте:
1. Логи: `pm2 logs`
2. Доступность 3x-ui панелей
3. Правильность credentials в `.env`
4. Nginx конфигурацию: `nginx -t`