# Lexora API

**Lexora** - це додаток для вивчення мов за допомогою карточок (flashcards). API надає функціонал для створення та організації карточок у колоди та папки, з підтримкою різних мов та AI-сервісів для автоматичного заповнення даних.

## Основні функції

- 🃏 **Карточки (Cards)** - створення та управління карточками для вивчення слів
- 📚 **Колоди (Decks)** - організація карточок у тематичні групи
- 📁 **Папки (Folders)** - ієрархічна структура для організації колод
- 🌍 **Мови (Languages)** - підтримка різних мов вивчення з кешуванням списку мов
- 🤖 **AI Сервіси** - автоматичне заповнення даних карточок через Google Vertex AI (Gemini)
- 🔊 **Озвучка (Text-to-Speech)** - генерація аудіо для карток через Google Cloud TTS
- 🔐 **OAuth (Google)** - авторизація через Google акаунт
- 👤 **Аутентифікація** - реєстрація, вхід, JWT токени, refresh токени
- 📊 **Дашборд** - головна сторінка з переглядом папок та колод (в майбутньому буде статистика)
- 🎓 **Система навчання** - сесії вивчення нових карток та повторення з підтримкою різних стратегій (pair_it, guess_it, recall_it, type_it)
- 📈 **Tracking прогресу** - система мастерства (mastery score 0-100), CEFR рівні складності
- ⚙️ **Налаштування** - зміна мови інтерфейсу користувача
- 🛡️ **Rate Limiting** - захист від зловживань API (20 запитів/сек, 100 запитів/хв)

## Технології проекту

### Backend Framework

- **NestJS** - прогресивний Node.js фреймворк для створення ефективних та масштабованих серверних додатків
- **TypeScript** - типізована надмножина JavaScript
- **Node.js 20** - середовище виконання JavaScript

### База даних та ORM

- **PostgreSQL 16** - реляційна база даних
- **Prisma** - сучасний ORM для TypeScript/JavaScript
- **Redis 7** - in-memory база даних для кешування та сесій
- **Cache Manager** - система кешування з підтримкою TTL для оптимізації продуктивності API

### Аутентифікація та авторизація

- **Passport.js** - middleware для аутентифікації
- **JWT (JSON Web Tokens)** - для токенів доступу
- **Argon2** - для хешування паролів
- **Local Strategy** - для аутентифікації логін/пароль
- **JWT Strategy** - для перевірки JWT токенів

### Валідація та документація

- **Class Validator** - для валідації вхідних даних
- **Class Transformer** - для трансформації та серіалізації даних
- **Swagger** - автоматична генерація API документації з підтримкою Bearer токенів

### DevOps та контейнеризація

- **Docker** - контейнеризація додатку
- **Docker Compose** - оркестрація контейнерів
- **pgAdmin** - веб-інтерфейс для управління PostgreSQL

### Інструменти розробки

- **ESLint** - лінтер для JavaScript/TypeScript
- **Prettier** - форматування коду
- **Jest** - фреймворк для тестування
- **Husky** - Git hooks для pre-commit перевірок
- **lint-staged** - запуск лінтерів на staged файлах
- **Morgan** - HTTP request logger для відстеження запитів у development режимі

### Безпека та обмеження

- **Throttler** - обмеження кількості запитів (rate limiting)
- **Custom Guards** - кастомні охоронці для додаткового захисту

### AI та машинне навчання

- **Google Vertex AI** - платформа для роботи з AI моделями
- **Gemini 2.5** - модель штучного інтелекту для генерації контенту карточок
- **Structured Generation** - генерація структурованих JSON відповідей

### Додаткові бібліотеки

- **UUID** - генерація унікальних ідентифікаторів
- **IORedis** - клієнт для Redis
- **Reflect Metadata** - підтримка метаданих для декораторів
- **Google Auth Library** - бібліотека для верифікації Google OAuth токенів
- **Express Static** - сервінг статичних файлів з папки `/public` (аудіо файли озвучки)

## Змінні оточення

Створіть файл `.env` у корені проекту з наступними змінними:

### База даних та кешування

- `DATABASE_URL` — URL підключення до PostgreSQL бази даних (наприклад: `postgresql://admin:1234@localhost:5433/lexora`)
- `REDIS_HOST` — хост Redis сервера (за замовчуванням: `localhost`)
- `REDIS_PORT` — порт Redis сервера (за замовчуванням: `6379`)

### Безпека та аутентифікація

- `JWT_SECRET` — секретний ключ для підпису JWT access токенів
- `JWT_REFRESH_SECRET` — секретний ключ для підпису JWT refresh токенів
- `PASSWORD_SECRET` — секретний ключ для додаткового хешування паролів разом з Argon2

### Google Cloud сервіси

- `GOOGLE_API` — API ключ Google Cloud Project з увімкненим Text-to-Speech API (використовується для синтезу та отримання списку голосів)
- `GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID з Google Cloud Console (використовується для перевірки Google ID Token у `/auth/google`)
- `GOOGLE_VERTEX_AI_JSON_PATH` — шлях до JSON файлу з ключами доступу Google Vertex AI (наприклад, `./keys/lexora-vertex-ai.json`)
- `GOOGLE_VERTEX_AI_JSON_PATH_REGION` — регіон Google Vertex AI (за замовчуванням: `europe-west4`)

### Сервер

- `PORT` — порт для запуску API сервера (за замовчуванням: `4000`)

### Приклад .env файлу

```env
# Database
DATABASE_URL="postgresql://admin:1234@localhost:5433/lexora"
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
PASSWORD_SECRET=your-super-secret-password-key-change-in-production

# Google Cloud
GOOGLE_API=your-google-cloud-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_VERTEX_AI_JSON_PATH=./keys/lexora-vertex-ai.json
GOOGLE_VERTEX_AI_JSON_PATH_REGION=europe-west4

# Server
PORT=4000
```

## Озвучка карток (Google Cloud Text-to-Speech)

- При створенні або зміні карточки сервіс автоматично генерує озвучку мовою, яку користувач вивчає. Для кожної мови можуть створюватися жіночий та чоловічий варіанти озвучки.
- Згенеровані файли кешуються і зберігаються у `public/tts` з хешованою назвою, тому повторний синтез для однакових параметрів не виконується.
- Перед записом нового аудіо попередні файли без використання автоматично видаляються.

### Налаштування голосів

1. Отримайте API ключ у Google Cloud Console та додайте його в змінну `GOOGLE_API`.
2. Виконайте `npm run seed` — скрипт автоматично підтягне необхідні голоси з Google Cloud.

## AI Сервіси (Google Vertex AI)

- Сервіс автоматично генерує структуровані дані для карточок використовуючи модель Gemini 2.5
- AI аналізує текст у мові, яку користувач вивчає, та створює детальну інформацію:
  - Визначення слова (коротке та довге)
  - Частина мови (noun, verb, adjective тощо)
  - Приклади використання
  - Синоніми та антоніми
  - Переклади на різні мови
  - CEFR рівень складності
- Генерація відбувається з використанням структурованого JSON схеми для забезпечення консистентності даних

### Налаштування Vertex AI

1. Створіть проект у Google Cloud Console та увімкніть Vertex AI API
2. Створіть Service Account та завантажте JSON ключ у папку `keys/`
3. Додайте шлях до ключа в змінну `GOOGLE_VERTEX_AI_JSON_PATH`
4. Встановіть регіон у змінній `GOOGLE_VERTEX_AI_JSON_PATH_REGION` (за замовчуванням: `europe-west4`)

## Система навчання карток

### Процес навчання

Lexora використовує інтервальну систему повторень для ефективного запам'ятовування:

1. **Нові картки** - позначаються як `isNew: true`, не розпочато навчання
2. **Картки в процесі** - `isNew: false`, `masteryScore` від 0 до 99
3. **Вивчені картки** - `masteryScore: 100`, повністю засвоєні

### Сесії навчання

- **Learning Session** - вивчення нових карток (GET `/deck/start-learning-session`)
- **Review Session** - повторення вивчених карток (GET `/deck/start-review-session`)
- Картки потребують повторення кожні **12 годин** після останнього перегляду

### Стратегії навчання

При завершенні повторення картки (`PATCH /deck/finish-review-card`) можна використовувати різні стратегії:

- `pair_it` - підбір пар (слово-переклад)
- `guess_it` - вгадування за підказками
- `recall_it` - вільне згадування
- `type_it` - друкування слова

### CEFR рівні складності

Картки автоматично класифікуються за рівнями складності Європейської шкали:

- `A1`, `A2` - початковий рівень
- `B1`, `B2` - середній рівень
- `C1`, `C2` - просунутий рівень

## Вхід через Google (OAuth 2.0)

- Клієнтська частина отримує ID Token через Google Sign-In та передає його в `POST /auth/google` разом із `accountId`.
- Сервіс перевіряє токен з використанням `GOOGLE_CLIENT_ID`, створює нового користувача (якщо email ще не зареєстрований) або прив'язує Google-акаунт до існуючого запису.
- У відповіді повертаються JWT токени та дані користувача, як і під час локального входу.

## Аутентифікація та безпека

### JWT токени

- **Access Token** - термін дії: **3 години** (180 хвилин)
- **Refresh Token** - термін дії: **7 днів**
- Токени підписуються окремими секретними ключами (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- При logout токен додається до чорного списку в Redis до закінчення терміну дії

### Хешування паролів

- Використовується **Argon2** - одна з найбезпечніших функцій хешування
- Додатковий секретний ключ `PASSWORD_SECRET` для підвищення безпеки

## Кешування (Cache Manager)

- Система кешування використовується для оптимізації продуктивності API
- Список всіх мов (`GET /languages/all`) кешується на 24 години, оскільки ці дані рідко змінюються
- Кеш автоматично очищується після закінчення TTL або при перезапуску сервера
- Для персоналізованих даних користувача (`GET /languages/my`) кешування не використовується, щоб завжди повертати актуальні дані
- Redis також використовується для зберігання чорного списку JWT токенів після logout

## Структура бази даних

### Основні моделі

- **User** - користувачі системи
  - Зв'язок з мовою інтерфейсу за замовчуванням (`languageCode`)
  - Може мати декілька `Account` (credentials, Google OAuth)
- **Account** - облікові записи користувачів
  - Підтримка різних провайдерів: `credentials` (email/password), `google` (OAuth)
  - Зберігає `passwordHash` тільки для credentials типу

- **Language** - підтримувані мови
  - Код мови як primary key (наприклад: `en-US`, `uk-UA`)
  - Масиви голосів Google TTS для чоловічого та жіночого озвучення

- **Folder** - папки для організації колод
  - Підтримка ієрархічної структури (самопосилання через `parentId`)
  - Каскадне видалення дочірніх папок та колод

- **Deck** - колоди карток
  - Зв'язок з двома мовами: `languageWhatIKnow` та `languageWhatILearn`
  - Можуть бути в папці або на корневому рівні (`folderId` nullable)

- **Card** - картки для вивчення
  - Текст та опис на обох мовах
  - `masteryScore` (0-100) для tracking прогресу
  - `isNew` для відслідковування початку навчання
  - `lastReviewedAt` для інтервального повторення
  - `soundUrls` - масив URL озвучки
  - `cefr` - рівень складності (A1-C2)

## API документація та валідація

### Swagger UI

- Доступний за адресою: http://localhost:4000/api
- Експорт в форматі JSON: http://localhost:4000/api-json
- Експорт в форматі YAML: http://localhost:4000/api-yaml
- Підтримка Bearer токенів (автоматичне додавання до всіх авторизованих запитів)
- Збереження токену в LocalStorage браузера (persistAuthorization)

### Формат помилок валідації

При невалідних даних API повертає структуровану відповідь:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "errors": {
    "email": ["email must be an email"],
    "password": ["password must be longer than or equal to 8 characters"]
  }
}
```

### Обмеження довжини полів

- Назва папки: максимум **50 символів**
- Назва колоди: максимум **50 символів**
- Текст картки: максимум **100 символів**
- Опис картки: максимум **100 символів**

## Rate Limiting (Throttling)

Система має два рівні обмежень запитів:

- **Short** - 20 запитів за 1 секунду (1000 мс)
- **Long** - 100 запитів за 1 хвилину (60000 мс)

Окремі ендпоінти можуть мати посилені обмеження:

- Логін та реєстрація: максимум **5 запитів за 30 секунд**

При перевищенні ліміту повертається помилка:

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later."
}
```

## API Endpoints

API має наступні основні групи ендпоінтів:

### Authentication (`/auth`)

- `POST /auth/register` - реєстрація нового користувача
- `POST /auth/login` - вхід через email/password
- `POST /auth/google` - вхід через Google OAuth
- `POST /auth/logout` - вихід (додавання токену до чорного списку)
- `POST /auth/refresh` - оновлення access токену через refresh token
- `GET /auth/me` - отримання інформації про поточного користувача

### Dashboard (`/dashboard`)

- `GET /dashboard` - головна сторінка з папками та колодами

### Folders (`/folder`)

- `POST /folder/create` - створення папки
- `PATCH /folder/rename` - перейменування папки
- `DELETE /folder/delete` - видалення папки

### Decks (`/deck`)

- `POST /deck/create` - створення колоди
- `GET /deck/:id` - отримання колоди з статистикою
- `PATCH /deck/rename` - перейменування колоди
- `DELETE /deck/delete` - видалення колоди
- `PATCH /deck/move` - переміщення колоди в папку
- `GET /deck/start-learning-session` - початок сесії вивчення нових карток
- `PATCH /deck/finish-learning-session` - завершення сесії вивчення
- `GET /deck/start-review-session` - початок сесії повторення
- `PATCH /deck/finish-review-card` - завершення повторення картки

### Cards (`/card`)

- `POST /card/create` - створення картки
- `GET /card/:id` - отримання картки
- `PATCH /card/update` - оновлення картки
- `DELETE /card/delete` - видалення картки

### Languages (`/languages`)

- `GET /languages/all` - список всіх підтримуваних мов (кешується на 24 години)
- `GET /languages/my` - список мов користувача

### AI (`/ai`)

- `POST /ai/fill-card-data` - автоматичне заповнення даних картки через Gemini AI

### Settings (`/settings`)

- `PATCH /settings/set-language` - зміна мови інтерфейсу користувача

### Static Files

- `GET /public/tts/*` - доступ до згенерованих аудіо файлів озвучки

## Compile and run the project in dev mode

```bash
# development
$ npm install
$ docker compose up -d
$ npx prisma generate
$ npx prisma migrate dev --name init
$ npm run seed  # Заповнення початкових даних (мови)
$ npm run dev
```

## Додаткові скрипти

```bash
# Перевірка типів без компіляції
$ npm run type-check

# Форматування коду
$ npm run format

# Лінтинг
$ npm run lint

# Тестування
$ npm run test
$ npm run test:watch
$ npm run test:cov

# Заповнення БД початковими даними
$ npm run seed
```

## Production build and run

```bash
# Компіляція проекту
$ npm run build

# Запуск в production режимі
$ npm run start:prod
```

Скомпільовані файли будуть у папці `dist/`.

## Docker

### Development

Проект містить `Dockerfile.dev` для розробки з hot reload:

```bash
# У docker-compose.yml розкоментуйте секцію backend
$ docker compose up -d
```

Backend контейнер буде автоматично перезапускатися при зміні файлів у папці `src/`.

### Основні Docker команди

```bash
# Запуск всіх сервісів
$ docker compose up -d

# Зупинка всіх сервісів
$ docker compose down

# Перегляд логів
$ docker compose logs -f

# Перегляд логів конкретного сервісу
$ docker compose logs -f db
$ docker compose logs -f redis

# Перезапуск сервісу
$ docker compose restart db
```

## Важливі примітки

### Безпека

⚠️ **ВАЖЛИВО**: Перед деплоєм у production:

1. Змініть всі секретні ключі (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `PASSWORD_SECRET`)
2. Використовуйте сильні паролі для бази даних
3. Налаштуйте CORS для обмеження доступу тільки з дозволених доменів
4. Розгляньте використання HTTPS
5. Встановіть обмеження rate limiting відповідно до ваших потреб

### Розширення проекту

Структура проекту підтримує легке розширення:

- Додавання нових модулів через NestJS CLI: `nest generate module module-name`
- Prisma міграції для змін в структурі БД: `npx prisma migrate dev --name migration-name`
- Swagger автоматично оновлюється при додаванні нових ендпоінтів з декораторами

## Доступні сервіси

### API та документація

- **Swagger UI**: http://localhost:4000/api
- **Swagger JSON**: http://localhost:4000/api-json
- **Swagger YAML**: http://localhost:4000/api-yaml
- **Static files (TTS audio)**: http://localhost:4000/public/tts/\*

### Бази даних та сервіси

- **PostgreSQL**: localhost:5433
  - Database: `lexora`
  - User: `admin`
  - Password: `1234`
- **pgAdmin**: http://localhost:5050
  - Email: `admin@lexora.com`
  - Password: `admin123`
- **Redis**: localhost:6379

## Структура проекту

```
lexora_api/
├── src/
│   ├── ai/              # AI сервіси (Gemini)
│   ├── auth/            # Аутентифікація та авторизація
│   ├── card/            # Управління картками
│   ├── dashboard/       # Головна сторінка
│   ├── database/        # Prisma сервіс
│   ├── deck/            # Управління колодами
│   ├── folder/          # Управління папками
│   ├── languages/       # Мови
│   ├── redis/           # Redis сервіс
│   ├── settings/        # Налаштування користувача
│   ├── tts/             # Text-to-Speech сервіс
│   ├── vertex/          # Google Vertex AI
│   ├── common/          # Спільні утиліти, guards, decorators
│   │   ├── config.ts    # Константи конфігурації
│   │   ├── seeds/       # Seed скрипти
│   │   ├── guards/      # Custom guards
│   │   ├── decorators/  # Custom decorators
│   │   └── types/       # TypeScript типи
│   ├── app.module.ts    # Головний модуль
│   └── main.ts          # Entry point
├── prisma/
│   ├── schema.prisma    # Схема бази даних
│   └── migrations/      # Міграції БД
├── public/
│   └── tts/             # Кешовані аудіо файли
├── keys/                # Ключі Google Cloud (не в git)
├── docker-compose.yml   # Docker конфігурація
├── Dockerfile.dev       # Dockerfile для development
└── .env                 # Змінні оточення (не в git)
```
