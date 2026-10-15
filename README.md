# 🔔 התזכורות שלי – Personal Reminders

אפליקציית תזכורות פשוטה וברורה, שנבנתה במיוחד עבור **אנשים מבוגרים** ועבור **מי שזקוק לעזרה בזכירת משימות יומיומיות** – תרופות, שתייה, ארוחות, תורים לרופא ועוד.

כתב גדול, כפתורים גדולים, תזכורת על כל המסך עם צליל והקראה בקול, ואפשרות לפנות מהר לבן משפחה או למטפל.

## ✨ מה יש באפליקציה

| | |
|---|---|
| 🏠 **מסך "היום"** | ברכה ושעון גדול, כרטיס "מה עכשיו" עם כפתור ענק *עשיתי*, דחייה ב-10 דקות והקראה בקול, התוכנית להיום וטבעת התקדמות |
| ⏰ **התראה על כל המסך** | בזמן התזכורת: צליל + הקראת המשימה בעברית (או הקלטה אישית), חוזרת עד שמגיבים. התראה מקדימה 15 דקות לפני, והתראות דפדפן כשהחלון ברקע |
| ➕ **הוספה בשלושה צעדים** | 8 תבניות בלחיצה (💊 תרופה, 💧 שתייה, 🍽️ ארוחה…), הכתבה קולית, זמנים מהירים ("בעוד שעה", "מחר 09:00"), חזרה יומית/שבועית/חודשית והקלטה קולית |
| 📋 **רשימת תזכורות** | חיפוש, סינון וקיבוץ לפי ימים; עריכה ומחיקה עם אישור |
| 📈 **היסטוריה** | אחוז הצלחה שבועי, רצף ימים, גרף של 7 ימים ורשימות "בוצעו" / "פוספסו" |
| 🤝 **איש קשר / מטפל** | כפתור חיוג מהיר בכותרת, והודעת וואטסאפ מוכנה כשמפספסים תזכורת |
| 👤 **פרופיל** | פרטים אישיים, מידע חשוב (תרופות, אלרגיות), שורות מידע חופשיות, בחירת צליל עם האזנה מקדימה, העלאת צליל אישי |
| 👓 **נגישות** | מצב טקסט גדול, ניגודיות גבוהה, RTL מלא, תמיכה בקורא מסך ובמקלדת, מותאם לטלפון |

## 🧱 טכנולוגיות

- **Client:** React 18, Axios, CSS (design system אחד, ללא ספריות UI)
- **Server:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Multer, Helmet

## 🚀 הרצה מקומית

דרישות: Node.js 18+ ו-MongoDB (מקומי או Atlas).

**1. שרת**

```bash
cd reminder-server
npm install
cp .env.example .env   # ולמלא JWT_SECRET
npm run dev
```

ליצירת `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

השרת עולה על http://localhost:5001 (בדיקה: http://localhost:5001/api/health).

**2. אפליקציה**

```bash
cd reminder-app
npm install
npm start
```

האפליקציה נפתחת על http://localhost:3000.

## 🧪 בדיקות

```bash
cd reminder-app && npm test
cd reminder-server && npm test
```

## 🔌 API

כל הנתיבים (מלבד `auth`) דורשים `Authorization: Bearer <token>`.

| שיטה | נתיב | תיאור |
|---|---|---|
| POST | `/api/auth/register` | הרשמה → `{ token, user }` |
| POST | `/api/auth/login` | כניסה → `{ token, user }` |
| GET / PUT | `/api/users/me` | קריאה / עדכון פרופיל וצליל |
| GET / POST | `/api/users/me/sound` | צליל אישי (multipart: `sound`) |
| GET | `/api/reminders` | כל התזכורות של המשתמש |
| POST | `/api/reminders` | יצירה (multipart: `task`, `executionDate`, `recurrence`, `category`, `recording`) |
| PATCH | `/api/reminders/:id` | עריכה |
| POST | `/api/reminders/:id/complete` | סימון כבוצע (ויצירת המופע הבא בתזכורת חוזרת) |
| POST | `/api/reminders/:id/undo` | ביטול סימון |
| POST | `/api/reminders/:id/snooze` | דחייה `{ minutes }` |
| DELETE | `/api/reminders/:id` | מחיקה |

## 📁 מבנה

```
reminder-app/src
├── pages/        Today · Add · Reminders · History · Profile · Auth
├── components/   Shell, AlertEngine, ReminderCard, Modal…
├── context/      Auth, Reminders, Toast
├── hooks/        useNow, useRecorder, useDictation, usePreferences…
├── lib/          api, time, stats, sounds, categories, caregiver
└── styles.css
reminder-server
├── routes/       auth, users, reminders
├── models/       User, Reminder
├── middleware/   auth (JWT), upload
├── lib/          recurrence
└── server.js
```
