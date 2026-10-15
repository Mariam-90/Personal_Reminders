# 🔔 Personal Reminders

A simple, clear reminder app built for **older adults** and for **anyone who needs help remembering everyday tasks**: medication, drinking water, meals, doctor appointments and more.

Large text, large buttons, a full-screen alert with sound and read-aloud, and a quick way to reach a family member or caregiver.

## ✨ Features

| | |
|---|---|
| 🏠 **Today screen** | Greeting and a large clock, a "what's next" card with a big *Done* button, 10-minute snooze and read-aloud, today's plan and a progress ring |
| ⏰ **Full-screen alert** | At reminder time: a sound plus the task read aloud (or a personal recording), repeated until the user responds. A heads-up 15 minutes before, and browser notifications when the window is in the background |
| ➕ **Add in three steps** | 8 one-tap templates (💊 medicine, 💧 drink, 🍽️ meal…), voice dictation, quick times ("in an hour", "tomorrow 09:00"), daily / weekly / monthly repeat, and a voice recording |
| 📋 **Reminders list** | Search, filters and grouping by day; edit, and delete with confirmation |
| 📈 **History** | Weekly success rate, day streak, a 7-day chart, and "done" / "missed" lists |
| 🤝 **Caregiver contact** | Quick-call button in the header, and a ready-made WhatsApp message when a reminder is missed |
| 👤 **Profile** | Personal details, important information (medication, allergies), free-form info rows, sound picker with preview, upload of a personal sound |
| 🌐 **3 languages** | Hebrew, Arabic and English, including direction (RTL/LTR), dates and times, read-aloud and dictation in the selected language |
| 👓 **Accessibility** | Large-text mode, high contrast, full RTL, screen-reader and keyboard support, mobile friendly |

## 🧱 Tech stack

- **Client:** React 18, Axios, plain CSS (a single design system, no UI library)
- **Server:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Multer, Helmet

## 🚀 Running locally

Requirements: Node.js 18+ and MongoDB (local or Atlas).

**1. Server**

```bash
cd reminder-server
npm install
cp .env.example .env   # then fill in JWT_SECRET
npm run dev
```

To generate a `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server runs on http://localhost:5001 (health check: http://localhost:5001/api/health).

**2. App**

```bash
cd reminder-app
npm install
npm start
```

The app opens on http://localhost:3000.

## 🧪 Tests

```bash
cd reminder-app && npm test
cd reminder-server && npm test
```

- **Server** (`node:test` + `supertest` + a throwaway in-memory MongoDB, so your real database is never touched): sign-up and login, route protection, isolation between users, create / edit / snooze / complete / delete, recurring reminders, file uploads, profile and sounds.
- **App** (Jest + Testing Library): time formatting, reminder status, statistics, caregiver links, the login screen, and translations (all three languages have the same keys and placeholders).
- **CI:** GitHub Actions runs all tests and the production build on every push to `main` and on every pull request.

## 🔌 API

Every route except `auth` requires `Authorization: Bearer <token>`.
Errors are returned as `{ error, code }`: the client translates `code`, and `error` is an English fallback.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Sign up → `{ token, user }` |
| POST | `/api/auth/login` | Log in → `{ token, user }` |
| GET / PUT | `/api/users/me` | Read / update the profile and sound |
| GET / POST | `/api/users/me/sound` | Personal sound (multipart: `sound`) |
| GET | `/api/reminders` | All of the user's reminders |
| POST | `/api/reminders` | Create (multipart: `task`, `executionDate`, `recurrence`, `category`, `recording`) |
| PATCH | `/api/reminders/:id` | Edit |
| POST | `/api/reminders/:id/complete` | Mark as done (and create the next occurrence of a recurring reminder) |
| POST | `/api/reminders/:id/undo` | Undo "done" |
| POST | `/api/reminders/:id/snooze` | Snooze `{ minutes }` |
| DELETE | `/api/reminders/:id` | Delete |

## 📁 Project structure

```
reminder-app/src
├── pages/        Today · Add · Reminders · History · Profile · Auth
├── components/   Shell, AlertEngine, ReminderCard, Modal, LanguageMenu…
├── context/      Auth, I18n, Reminders, Toast
├── i18n/         he · ar · en dictionaries + t()
├── hooks/        useNow, useRecorder, useDictation, usePreferences…
├── lib/          api, time, stats, sounds, categories, caregiver
└── styles.css
reminder-server
├── routes/       auth, users, reminders
├── models/       User, Reminder
├── middleware/   auth (JWT), upload
├── lib/          recurrence, errors
├── test/         API and unit tests
├── app.js        Express app
└── server.js     DB connection + listen
```
