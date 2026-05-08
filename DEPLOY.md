# Деплой на VPS

## Что нужно купить
VPS с Ubuntu 22.04 у любого российского хостера: Timeweb Cloud, Beget, REG.RU, Selectel.
Минимальная конфигурация: 1 CPU, 1 GB RAM, 10 GB диск — хватит с запасом.
Примерная цена: 300–500 ₽/месяц.

---

## 1. Подготовка сервера (один раз)

Подключитесь к серверу по SSH и выполните команды:

```bash
# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com | sh

# Устанавливаем Git
apt install git -y
```

---

## 2. Загрузка кода на сервер

```bash
# Клонируем репозиторий (замените URL на ваш)
git clone https://github.com/ваш-аккаунт/hochu-dom.git
cd hochu-dom/app
```

---

## 3. Настройка переменных окружения

```bash
# Копируем шаблон
cp .env.example .env

# Открываем для редактирования
nano .env
```

Заполните файл:
```
DATABASE_URL="file:/app/data/prod.db"
NEXTAUTH_SECRET="любая длинная случайная строка, минимум 32 символа"
NEXTAUTH_URL="https://ваш-домен.ru"
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="ваш надёжный пароль"
```

Сохранить в nano: Ctrl+O → Enter → Ctrl+X

Сгенерировать случайный NEXTAUTH_SECRET можно командой:
```bash
openssl rand -base64 32
```

---

## 4. Запуск

```bash
docker compose up -d --build
```

Первый запуск занимает 2–5 минут (идёт сборка). После этого сайт доступен на порту 3000.

Проверить что всё работает:
```bash
docker compose logs -f
```

---

## 5. Домен и HTTPS (опционально, но рекомендуется)

Установите nginx как обратный прокси:

```bash
apt install nginx certbot python3-certbot-nginx -y
```

Создайте конфиг `/etc/nginx/sites-available/hochudom`:
```nginx
server {
    server_name ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/hochudom /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Получить бесплатный SSL-сертификат
certbot --nginx -d ваш-домен.ru
```

---

## 6. Обновление после изменений в коде

```bash
git pull
docker compose up -d --build
```

---

## Полезные команды

```bash
# Посмотреть логи
docker compose logs -f

# Перезапустить
docker compose restart

# Остановить
docker compose down

# Войти в контейнер (например, чтобы посмотреть БД)
docker compose exec app sh
```
