# Lexora API

## Технології проекту

### Backend Framework

- **NestJS** - прогресивний Node.js фреймворк для створення ефективних та масштабованих серверних додатків
- **TypeScript** - типізована надмножина JavaScript
- **Node.js** - середовище виконання JavaScript

### База даних та ORM

- **PostgreSQL 16** - реляційна база даних
- **Prisma** - сучасний ORM для TypeScript/JavaScript
- **Redis 7** - in-memory база даних для кешування та сесій

### Аутентифікація та авторизація

- **Passport.js** - middleware для аутентифікації
- **JWT (JSON Web Tokens)** - для токенів доступу
- **Argon2** - для хешування паролів
- **Local Strategy** - для аутентифікації логін/пароль
- **JWT Strategy** - для перевірки JWT токенів

### Валідація та документація

- **Class Validator** - для валідації даних
- **Swagger** - автоматична генерація API документації

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

### Додаткові бібліотеки

- **RxJS** - реактивне програмування
- **UUID** - генерація унікальних ідентифікаторів
- **IORedis** - клієнт для Redis
- **Reflect Metadata** - підтримка метаданих для декораторів

## Compile and run the project

```bash
# development
$ npm run dev
$ docker compose up -d
```

## Доступні сервіси

- **API сервер**: http://localhost:4000
- **PostgreSQL**: localhost:5433
- **pgAdmin**: http://localhost:5050 (admin@lexora.com / admin123)
- **Redis**: localhost:6379
