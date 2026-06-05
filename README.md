# Marathon Skills 2026 — Next.js Web App

Полное веб-приложение с авторизацией через Google (OAuth 2.0), базой данных Supabase (PostgreSQL) и деплоем на Vercel.

---

## Стек

| Слой | Технология |
|------|-----------|
| Фронтенд | Next.js 14 (Pages Router) + TypeScript |
| Авторизация | NextAuth.js + Google OAuth 2.0 |
| База данных | Supabase (PostgreSQL) |
| API | Vercel Serverless Functions (`/pages/api`) |
| Деплой | Vercel |

---

## Быстрый старт

### 1. Клонируй и установи зависимости

```bash
git clone <your-repo>
cd marathon-skills
npm install
```

### 2. Настрой Supabase

1. Зайди на [supabase.com](https://supabase.com) → New Project
2. В разделе **SQL Editor** выполни весь код из файла `supabase-schema.sql`
3. В разделе **Settings → API** скопируй:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Настрой Google OAuth

1. Открой [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Тип: **Web application**
4. Разрешённые redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-app.vercel.app/api/auth/callback/google` (prod)
5. Скопируй Client ID и Client Secret

### 4. Создай `.env.local`

```bash
cp .env.example .env.local
```

Заполни все значения в `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<случайная строка, например: openssl rand -base64 32>

GOOGLE_CLIENT_ID=<из Google Console>
GOOGLE_CLIENT_SECRET=<из Google Console>

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>

# Email-адреса администраторов (через запятую)
ADMIN_EMAILS=your@gmail.com
```

### 5. Запусти dev-сервер

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

---

## Деплой на Vercel

```bash
npm i -g vercel
vercel
```

Все переменные из `.env.local` добавь в **Vercel Dashboard → Settings → Environment Variables**.

Не забудь обновить:
- `NEXTAUTH_URL` → `https://your-app.vercel.app`
- Google OAuth redirect URI → добавить `https://your-app.vercel.app/api/auth/callback/google`

---

## Структура проекта

```
marathon-skills/
├── lib/
│   ├── supabase.ts       # Supabase клиенты (public + admin)
│   └── timer.ts          # Countdown до 15.06.2026
├── components/
│   ├── Layout.tsx         # Шапка + таймер-футер + аватар пользователя
│   └── withAuth.tsx       # HOC — защита маршрутов
├── pages/
│   ├── _app.tsx           # SessionProvider
│   ├── index.tsx          # Главная (About)
│   ├── login.tsx          # Вход через Google
│   ├── register.tsx       # Регистрация бегуна
│   ├── bmi.tsx            # BMI калькулятор
│   ├── participants/
│   │   └── index.tsx      # Список участников
│   ├── admin/
│   │   ├── login.tsx      # Вход администратора (admin/admin)
│   │   ├── users.tsx      # Управление пользователями
│   │   └── edit/[id].tsx  # Редактирование пользователя
│   └── api/
│       ├── auth/[...nextauth].ts  # NextAuth Google OAuth
│       └── runners/
│           ├── index.ts   # GET all, POST create
│           ├── [id].ts    # GET one, PUT update, DELETE
│           └── me.ts      # GET current user's runner
├── styles/
│   └── globals.css        # Тёмная тема, кнопки, таблицы
├── supabase-schema.sql    # SQL схема БД
├── .env.example           # Шаблон переменных окружения
└── next.config.js
```

---

## Маршруты

| URL | Описание | Защищён |
|-----|---------|--------|
| `/` | Главная (About + таймер) | ✅ |
| `/login` | Вход через Google | ❌ |
| `/register` | Регистрация бегуна | ✅ |
| `/bmi` | BMI калькулятор | ✅ |
| `/participants` | Список участников | ✅ |
| `/admin/login` | Вход администратора | ✅ |
| `/admin/users` | Управление пользователями | ✅ |
| `/admin/edit/[id]` | Редактирование пользователя | ✅ |

## API

| Endpoint | Method | Описание |
|---------|--------|---------|
| `/api/runners` | GET | Все бегуны (фильтр, сортировка, поиск) |
| `/api/runners` | POST | Зарегистрировать бегуна |
| `/api/runners/me` | GET | Профиль текущего пользователя |
| `/api/runners/:id` | GET | Один бегун |
| `/api/runners/:id` | PUT | Обновить (owner или admin) |
| `/api/runners/:id` | DELETE | Удалить (только admin) |
