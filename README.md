# Lexora API

**Lexora** is a language learning application using flashcards. The API provides functionality for creating and organizing flashcards into decks and folders, with support for different languages and AI services for automatic data filling.

🌐 **Website**: [https://lexora.co.ua/](https://lexora.co.ua/)  
📖 **API Documentation**: [https://api.lexora.co.ua/api](https://api.lexora.co.ua/api)

## Main Features

- 🃏 **Cards** - creation and management of flashcards for learning words
- 📚 **Decks** - organization of cards into thematic groups
- 📁 **Folders** - hierarchical structure for organizing decks
- 🌍 **Languages** - support for different learning languages with language list caching
- 🤖 **AI Services** - automatic card data filling via Google Vertex AI (Gemini)
- 🔊 **Text-to-Speech** - audio generation for cards via Google Cloud TTS
- 🔐 **OAuth (Google)** - authorization via Google account
- 👤 **Authentication** - registration, login, JWT tokens, refresh tokens
- 📊 **Dashboard** - main page with folders and decks view (statistics coming in the future)
- 🎓 **Learning System** - learning sessions for new cards and review sessions with support for different strategies (pair_it, guess_it, recall_it, type_it)
- 📈 **Progress Tracking** - mastery system (mastery score 0-100), CEFR difficulty levels
- ⚙️ **Settings** - user interface language change
- 🛡️ **Rate Limiting** - protection against API abuse (20 requests/sec, 100 requests/min)

## Project Technologies

### Backend Framework

- **NestJS** - a progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript** - typed superset of JavaScript
- **Node.js 20** - JavaScript runtime environment

### Database and ORM

- **PostgreSQL 16** - relational database
- **Prisma** - modern ORM for TypeScript/JavaScript
- **Redis 7** - in-memory database for caching and sessions
- **Cache Manager** - caching system with TTL support for API performance optimization

### Authentication and Authorization

- **Passport.js** - authentication middleware
- **JWT (JSON Web Tokens)** - for access tokens
- **Argon2** - for password hashing
- **Local Strategy** - for login/password authentication
- **JWT Strategy** - for JWT token verification

### Validation and Documentation

- **Class Validator** - for input data validation
- **Class Transformer** - for data transformation and serialization
- **Swagger** - automatic API documentation generation with Bearer token support

### DevOps and Containerization

- **Docker** - application containerization
- **Docker Compose** - container orchestration
- **pgAdmin** - web interface for PostgreSQL management

### Development Tools

- **ESLint** - linter for JavaScript/TypeScript
- **Prettier** - code formatting
- **Jest** - testing framework
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - run linters on staged files
- **Morgan** - HTTP request logger for tracking requests in development mode

### Security and Limitations

- **Throttler** - request rate limiting
- **Custom Guards** - custom guards for additional protection

### AI and Machine Learning

- **Google Vertex AI** - platform for working with AI models
- **Gemini 2.5** - artificial intelligence model for card content generation
- **Structured Generation** - generation of structured JSON responses

### Additional Libraries

- **UUID** - unique identifier generation
- **IORedis** - Redis client
- **Reflect Metadata** - metadata support for decorators
- **Google Auth Library** - library for verifying Google OAuth tokens
- **Express Static** - serving static files from `/public` folder (audio files for pronunciation)

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Database and Caching

- `DATABASE_URL` — PostgreSQL database connection URL (e.g.: `postgresql://admin:1234@localhost:5433/lexora`)
- `REDIS_HOST` — Redis server host (default: `localhost`)
- `REDIS_PORT` — Redis server port (default: `6379`)

### Security and Authentication

- `JWT_SECRET` — secret key for signing JWT access tokens
- `JWT_REFRESH_SECRET` — secret key for signing JWT refresh tokens
- `PASSWORD_SECRET` — secret key for additional password hashing along with Argon2

### Google Cloud Services

- `GOOGLE_API` — Google Cloud Project API key with Text-to-Speech API enabled (used for synthesis and getting voice lists)
- `GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID from Google Cloud Console (used for verifying Google ID Token in `/auth/google`)
- `GOOGLE_VERTEX_AI_JSON_PATH` — path to JSON file with Google Vertex AI access keys (e.g., `./keys/lexora-vertex-ai.json`)
- `GOOGLE_VERTEX_AI_JSON_PATH_REGION` — Google Vertex AI region (default: `europe-west4`)

### Server

- `PORT` — port for running the API server (default: `4000`)

### Example .env File

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

## Card Pronunciation (Google Cloud Text-to-Speech)

- When creating or modifying a card, the service automatically generates pronunciation in the language the user is learning. For each language, both female and male pronunciation variants can be created.
- Generated files are cached and stored in `public/tts` with a hashed name, so repeated synthesis for the same parameters is not performed.
- Before writing new audio, previous unused files are automatically deleted.

### Voice Configuration

1. Get an API key in Google Cloud Console and add it to the `GOOGLE_API` variable.
2. Run `npm run seed` — the script will automatically fetch the necessary voices from Google Cloud.

## AI Services (Google Vertex AI)

- The service automatically generates structured data for cards using the Gemini 2.5 model
- AI analyzes text in the language the user is learning and creates detailed information:
  - Word definition (short and long)
  - Part of speech (noun, verb, adjective, etc.)
  - Usage examples
  - Synonyms and antonyms
  - Translations to different languages
  - CEFR difficulty level
- Generation occurs using a structured JSON schema to ensure data consistency

### Vertex AI Configuration

1. Create a project in Google Cloud Console and enable Vertex AI API
2. Create a Service Account and download the JSON key to the `keys/` folder
3. Add the path to the key in the `GOOGLE_VERTEX_AI_JSON_PATH` variable
4. Set the region in the `GOOGLE_VERTEX_AI_JSON_PATH_REGION` variable (default: `europe-west4`)

## Card Learning System

### Learning Process

Lexora uses a spaced repetition system for effective memorization:

1. **New cards** - marked as `isNew: true`, learning not started
2. **Cards in progress** - `isNew: false`, `masteryScore` from 0 to 99
3. **Learned cards** - `masteryScore: 100`, fully mastered

### Learning Sessions

- **Learning Session** - learning new cards (GET `/deck/start-learning-session`)
- **Review Session** - reviewing learned cards (GET `/deck/start-review-session`)
- Cards need review every **12 hours** after the last view

### Learning Strategies

When finishing a card review (`PATCH /deck/finish-review-card`), different strategies can be used:

- `pair_it` - matching pairs (word-translation)
- `guess_it` - guessing with hints
- `recall_it` - free recall
- `type_it` - typing the word

### CEFR Difficulty Levels

Cards are automatically classified by European Framework difficulty levels:

- `A1`, `A2` - beginner level
- `B1`, `B2` - intermediate level
- `C1`, `C2` - advanced level

## Google Sign-In (OAuth 2.0)

- The client side gets an ID Token through Google Sign-In and passes it to `POST /auth/google` along with `accountId`.
- The service verifies the token using `GOOGLE_CLIENT_ID`, creates a new user (if the email is not yet registered) or links the Google account to an existing record.
- The response returns JWT tokens and user data, as with local login.

## Authentication and Security

### JWT Tokens

- **Access Token** - expiry time: **3 hours** (180 minutes)
- **Refresh Token** - expiry time: **7 days**
- Tokens are signed with separate secret keys (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- On logout, the token is added to a blacklist in Redis until expiration

### Password Hashing

- Uses **Argon2** - one of the most secure hashing functions
- Additional secret key `PASSWORD_SECRET` for increased security

## Caching (Cache Manager)

- The caching system is used to optimize API performance
- The list of all languages (`GET /languages/all`) is cached for 24 hours, as this data rarely changes
- Cache is automatically cleared after TTL expiration or server restart
- For personalized user data (`GET /languages/my`), caching is not used to always return current data
- Redis is also used to store the JWT token blacklist after logout

## Database Structure

### Main Models

- **User** - system users
  - Link to default interface language (`languageCode`)
  - Can have multiple `Account` (credentials, Google OAuth)
- **Account** - user accounts
  - Support for different providers: `credentials` (email/password), `google` (OAuth)
  - Stores `passwordHash` only for credentials type

- **Language** - supported languages
  - Language code as primary key (e.g.: `en-US`, `uk-UA`)
  - Arrays of Google TTS voices for male and female pronunciation

- **Folder** - folders for organizing decks
  - Support for hierarchical structure (self-referencing via `parentId`)
  - Cascading deletion of child folders and decks

- **Deck** - card decks
  - Link to two languages: `languageWhatIKnow` and `languageWhatILearn`
  - Can be in a folder or at root level (`folderId` nullable)

- **Card** - learning cards
  - Text and description in both languages
  - `masteryScore` (0-100) for progress tracking
  - `isNew` for tracking learning start
  - `lastReviewedAt` for spaced repetition
  - `soundUrls` - array of pronunciation URLs
  - `cefr` - difficulty level (A1-C2)

## API Documentation and Validation

### Swagger UI

- **Production**: [https://api.lexora.co.ua/api](https://api.lexora.co.ua/api)
- **Local**: http://localhost:4000/api
- Export in JSON format: http://localhost:4000/api-json
- Export in YAML format: http://localhost:4000/api-yaml
- Bearer token support (automatic addition to all authorized requests)
- Token persistence in browser LocalStorage (persistAuthorization)

### Validation Error Format

With invalid data, the API returns a structured response:

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

### Field Length Limits

- Folder name: maximum **50 characters**
- Deck name: maximum **50 characters**
- Card text: maximum **100 characters**
- Card description: maximum **100 characters**

## Rate Limiting (Throttling)

The system has two levels of request limits:

- **Short** - 20 requests per 1 second (1000 ms)
- **Long** - 100 requests per 1 minute (60000 ms)

Individual endpoints can have stricter limits:

- Login and registration: maximum **5 requests per 30 seconds**

When the limit is exceeded, an error is returned:

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later."
}
```

## API Endpoints

The API has the following main endpoint groups:

### Authentication (`/auth`)

- `POST /auth/register` - register a new user
- `POST /auth/login` - login via email/password
- `POST /auth/google` - login via Google OAuth
- `POST /auth/logout` - logout (add token to blacklist)
- `POST /auth/refresh` - refresh access token via refresh token
- `GET /auth/me` - get current user information

### Dashboard (`/dashboard`)

- `GET /dashboard` - main page with folders and decks

### Folders (`/folder`)

- `POST /folder/create` - create folder
- `PATCH /folder/rename` - rename folder
- `DELETE /folder/delete` - delete folder

### Decks (`/deck`)

- `POST /deck/create` - create deck
- `GET /deck/:id` - get deck with statistics
- `PATCH /deck/rename` - rename deck
- `DELETE /deck/delete` - delete deck
- `PATCH /deck/move` - move deck to folder
- `GET /deck/start-learning-session` - start learning session for new cards
- `PATCH /deck/finish-learning-session` - finish learning session
- `GET /deck/start-review-session` - start review session
- `PATCH /deck/finish-review-card` - finish card review

### Cards (`/card`)

- `POST /card/create` - create card
- `GET /card/:id` - get card
- `PATCH /card/update` - update card
- `DELETE /card/delete` - delete card

### Languages (`/languages`)

- `GET /languages/all` - list of all supported languages (cached for 24 hours)
- `GET /languages/my` - list of user's languages

### AI (`/ai`)

- `POST /ai/fill-card-data` - automatic card data filling via Gemini AI

### Settings (`/settings`)

- `PATCH /settings/set-language` - change user interface language

### Static Files

- `GET /public/tts/*` - access to generated pronunciation audio files

## Compile and Run the Project in Dev Mode

```bash
# development
$ npm install
$ docker compose up -d
$ npx prisma generate
$ npx prisma migrate dev --name init
$ npm run seed  # Fill initial data (languages)
$ npm run dev
```

## Additional Scripts

```bash
# Type checking without compilation
$ npm run type-check

# Code formatting
$ npm run format

# Linting
$ npm run lint

# Testing
$ npm run test
$ npm run test:watch
$ npm run test:cov

# Fill DB with initial data
$ npm run seed
```

## Production Build and Run

```bash
# Build the project
$ npm run build

# Run in production mode
$ npm run start:prod
```

Compiled files will be in the `dist/` folder.

## Docker

### Development

The project contains `Dockerfile.dev` for development with hot reload:

```bash
# In docker-compose.yml, uncomment the backend section
$ docker compose up -d
```

The backend container will automatically restart when files in the `src/` folder change.

### Main Docker Commands

```bash
# Start all services
$ docker compose up -d

# Stop all services
$ docker compose down

# View logs
$ docker compose logs -f

# View logs of a specific service
$ docker compose logs -f db
$ docker compose logs -f redis

# Restart a service
$ docker compose restart db
```

## Important Notes

### Security

⚠️ **IMPORTANT**: Before deploying to production:

1. Change all secret keys (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `PASSWORD_SECRET`)
2. Use strong passwords for the database
3. Configure CORS to restrict access only from allowed domains
4. Consider using HTTPS
5. Set rate limiting according to your needs

### Project Extension

The project structure supports easy extension:

- Adding new modules via NestJS CLI: `nest generate module module-name`
- Prisma migrations for database structure changes: `npx prisma migrate dev --name migration-name`
- Swagger automatically updates when adding new endpoints with decorators

## Available Services

### API and Documentation

- **Website**: [https://lexora.co.ua/](https://lexora.co.ua/)
- **Swagger UI (Production)**: [https://api.lexora.co.ua/api](https://api.lexora.co.ua/api)
- **Swagger UI (Local)**: http://localhost:4000/api
- **Swagger JSON (Local)**: http://localhost:4000/api-json
- **Swagger YAML (Local)**: http://localhost:4000/api-yaml
- **Static files (TTS audio)**: http://localhost:4000/public/tts/\*

### Databases and Services

- **PostgreSQL**: localhost:5433
  - Database: `lexora`
  - User: `admin`
  - Password: `1234`
- **pgAdmin**: http://localhost:5050
  - Email: `admin@lexora.com`
  - Password: `admin123`
- **Redis**: localhost:6379

## Project Structure

```
lexora_api/
├── src/
│   ├── ai/              # AI services (Gemini)
│   ├── auth/            # Authentication and authorization
│   ├── card/            # Card management
│   ├── dashboard/       # Main page
│   ├── database/        # Prisma service
│   ├── deck/            # Deck management
│   ├── folder/          # Folder management
│   ├── languages/       # Languages
│   ├── redis/           # Redis service
│   ├── settings/        # User settings
│   ├── tts/             # Text-to-Speech service
│   ├── vertex/          # Google Vertex AI
│   ├── common/          # Common utilities, guards, decorators
│   │   ├── config.ts    # Configuration constants
│   │   ├── seeds/       # Seed scripts
│   │   ├── guards/      # Custom guards
│   │   ├── decorators/  # Custom decorators
│   │   └── types/       # TypeScript types
│   ├── app.module.ts    # Main module
│   └── main.ts          # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # DB migrations
├── public/
│   └── tts/             # Cached audio files
├── keys/                # Google Cloud keys (not in git)
├── docker-compose.yml   # Docker configuration
├── Dockerfile.dev       # Dockerfile for development
└── .env                 # Environment variables (not in git)
```
