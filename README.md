# 🎓 CRM — O'quv Markazlari Uchun Boshqaruv Tizimi

> **O'quv markazlarini to'liq boshqarish uchun zamonaviy REST API backend tizimi.**  
> O'quvchilar, o'qituvchilar, guruhlar, darslar, davomatlar va uy vazifalarini boshqaradi.

---

## 📋 Loyiha Haqida

Bu loyiha o'quv markazlari (learning centers) uchun CRM (Customer Relationship Management) tizimidir. Tizim orqali admin va superadmin foydalanuvchilar o'quv markazining barcha jarayonlarini — o'quvchilardan tortib, guruhlar, darslar va uy vazifalarigacha — to'liq boshqara olishadi.

---

## ⚙️ Texnologiyalar (Tech Stack)

| Texnologiya | Versiya | Maqsad |
|---|---|---|
| **NestJS** | v11 | Asosiy backend framework |
| **TypeScript** | v5.7 | Dasturlash tili |
| **Prisma ORM** | v7 | Ma'lumotlar bazasi bilan ishlash |
| **PostgreSQL** | — | Ma'lumotlar bazasi |
| **JWT** | — | Autentifikatsiya (token asosida) |
| **Bcrypt** | v6 | Parollarni xavfsiz saqlash |
| **Swagger** | v11 | API dokumentatsiya |
| **Nodemailer + Handlebars** | — | Email yuborish (shablon bilan) |
| **Multer** | — | Fayl yuklash (rasm va fayllar) |
| **Class-validator** | v0.14 | So'rovlarni tekshirish (validation) |
| **Class-transformer** | v0.5 | Ma'lumotlarni transformatsiya qilish |
| **@nestjs/serve-static** | v5 | Statik fayllarni serve qilish |
| **ESLint + Prettier** | — | Kod sifatini nazorat qilish |

---

## 🗂️ Loyiha Tuzilmasi

```
src/
├── app.module.ts              # Asosiy modul
├── main.ts                    # Server ishga tushirish, Swagger sozlamalari
│
├── core/
│   └── database/              # Prisma moduli va servisi
│
├── common/
│   ├── decorators/            # Custom dekoratorlar (@Roles, @CurrentUser)
│   ├── email/                 # Email yuborish moduli
│   ├── filters/               # Exception filter (xatoliklarni ushlash)
│   └── guards/                # JWT va Roles guard
│
├── modules/
│   ├── auth/                  # Autentifikatsiya (login, register, token)
│   ├── users/                 # Admin/Superadmin foydalanuvchilar
│   ├── students/              # O'quvchilarni boshqarish
│   ├── teachers/              # O'qituvchilarni boshqarish
│   ├── courses/               # Kurslarni boshqarish
│   ├── rooms/                 # Xonalarni boshqarish
│   ├── groups/                # Guruhlarni boshqarish
│   ├── lessons/               # Darslarni boshqarish
│   ├── attendance/            # Davomat (kim keldi, kim kelmadi)
│   └── homework/              # Uy vazifalarini boshqarish
│
├── templates/                 # Email shablonlari (Handlebars)
└── uploads/                   # Yuklangan fayllar (rasmlar va boshqalar)

prisma/
├── schema.prisma              # Ma'lumotlar bazasi sxemasi
└── migrations/                # DB migratsiyalari
```

---

## 🧩 Modullar va Funksiyalar

### 🔐 Auth (Autentifikatsiya)
- Foydalanuvchi **ro'yxatdan o'tishi** va **tizimga kirishi**
- **JWT token** chiqarish va tekshirish
- **Rol asosida** ruxsat (SUPERADMIN, ADMIN, TEACHER, STUDENT)

### 👤 Users (Foydalanuvchilar)
- SUPERADMIN va ADMIN rollidagi foydalanuvchilarni boshqarish
- CRUD operatsiyalari (yaratish, ko'rish, yangilash, o'chirish)
- Rasm yuklash

### 🎓 Students (O'quvchilar)
- O'quvchilarni ro'yxatdan o'tkazish
- Status boshqaruvi: `active`, `inactive`, `freeze`, `graduated`
- Guruhlarga qo'shish va chiqarish

### 👨‍🏫 Teachers (O'qituvchilar)
- O'qituvchilarni boshqarish
- Guruhlarga biriktirish
- Rasm yuklash

### 📚 Courses (Kurslar)
- Kurs yaratish va boshqarish
- Daraja: `beginner`, `intermediate`, `advanced`
- Narx, davomiyligi (oy va soat) ko'rsatish

### 🏠 Rooms (Xonalar)
- O'quv xonalarini ro'yxatga olish
- Guruhlarga biriktirish

### 👥 Groups (Guruhlar)
- Guruh yaratish — kurs, o'qituvchi, xona, kunlar, boshlanish vaqti bilan
- Guruh holati: `planned`, `active`, `completed`
- Guruh o'quvchilarini ko'rish
- Faol, tugatilgan va rejalashtirilgan guruhlarni filterlash

### 📖 Lessons (Darslar)
- Darslarni yaratish — mavzu va tavsif bilan
- Guruh va o'qituvchiga biriktirish

### ✅ Attendance (Davomat)
- Har bir dars uchun davomat yuritish
- O'quvchilar keldi/kelmadi deb belgilash
- O'qituvchi yoki admin tomonidan kiritiladi

### 📝 Homework (Uy Vazifasi)
- O'qituvchi tomonidan uy vazifasi berish
- Fayl biriktirish imkoniyati
- O'quvchi tomonidan javob yuborish (`HomeworkAnswer`)
- O'qituvchi tomonidan baho qo'yish (`HomeworkResult`)

---

## 🔑 Rollar va Ruxsatlar

| Rol | Imkoniyatlar |
|---|---|
| `SUPERADMIN` | Barcha modullar ustida to'liq nazorat |
| `ADMIN` | Barcha boshqaruv funksiyalari |
| `TEACHER` | Darslar, davomat, uy vazifalari |
| `STUDENT` | Uy vazifalariga javob yuborish |

---

## 🗄️ Ma'lumotlar Bazasi Modellari

```
Users          — Tizim foydalanuvchilari (Admin/Superadmin)
Student        — O'quvchilar
Teacher        — O'qituvchilar
Course         — Kurslar
Room           — Xonalar
Group          — Guruhlar
StudentGroup   — O'quvchi-Guruh bog'lanishi
Lesson         — Darslar
Attendance     — Davomat
Homework       — Uy vazifalari
HomeworkAnswer — Uy vazifasiga javoblar
HomeworkResult — Uy vazifasi natijalari (baho)
```

---

## 🚀 Loyihani Ishga Tushirish

### 1. Talablar
- **Node.js** v18+
- **PostgreSQL** o'rnatilgan va ishlab turgan bo'lishi kerak
- **npm** yoki **yarn**

### 2. O'rnatish

```bash
# Repozitoriyani clone qiling
git clone <repo-url>
cd "CRM project for learning centers"

# Paketlarni o'rnating
npm install
```

### 3. `.env` faylini sozlang

`.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"
JWT_SECRET="your_super_secret_key"
PORT=3000

# Email sozlamalari
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

### 4. Ma'lumotlar bazasini sozlang

```bash
# Migratsiyalarni ishga tushiring
npx prisma migrate dev

# Prisma client yarating
npx prisma generate
```

### 5. Serverni ishga tushiring

```bash
# Development rejimida (auto-reload bilan)
npm run start:dev

# Production rejimida
npm run build
npm run start:prod
```

---

## 📖 API Dokumentatsiya (Swagger)

Server ishga tushgandan so'ng quyidagi manzilga o'ting:

```
http://localhost:3000/swagger
```

Barcha endpoint'lar, so'rov va javob strukturalari Swagger UI orqali ko'rinadi.  
**Bearer Token** bilan autentifikatsiya qilingan so'rovlarni ham to'g'ridan-to'g'ri Swagger'dan yuborish mumkin.

---

## 📡 Asosiy API Endpoint'lar

```
POST   /api/v1/auth/login              — Tizimga kirish
POST   /api/v1/auth/register           — Ro'yxatdan o'tish

GET    /api/v1/users                   — Foydalanuvchilar ro'yxati
POST   /api/v1/users/create            — Yangi foydalanuvchi

GET    /api/v1/students                — O'quvchilar ro'yxati
POST   /api/v1/students/create         — Yangi o'quvchi

GET    /api/v1/teachers                — O'qituvchilar ro'yxati
POST   /api/v1/teachers/create         — Yangi o'qituvchi

GET    /api/v1/courses                 — Kurslar ro'yxati
POST   /api/v1/courses/create          — Yangi kurs

GET    /api/v1/groups/all              — Barcha guruhlar
POST   /api/v1/groups/create           — Yangi guruh
GET    /api/v1/groups/all/completeds   — Tugatilgan guruhlar
GET    /api/v1/groups/all/planneds     — Rejalashtirilgan guruhlar

GET    /api/v1/lessons                 — Darslar ro'yxati
POST   /api/v1/lessons/create          — Yangi dars

POST   /api/v1/attendance/create       — Davomat belgilash

POST   /api/v1/homework/create         — Uy vazifasi berish
POST   /api/v1/homework/answer         — Javob yuborish
POST   /api/v1/homework/result         — Baho qo'yish
```

---

## 🛡️ Xavfsizlik

- Barcha himoyalangan endpoint'lar **JWT Bearer Token** talab qiladi
- Parollar **bcrypt** bilan hash qilinadi
- **Rol asosida kirish nazorati** (RBAC) mavjud
- So'rovlar **class-validator** orqali tekshiriladi (whitelist = true)

---

## 📁 Fayl Yuklash

- Fayllar `src/uploads/` papkasiga saqlanadi
- Statik fayllar `/files/` endpoint'i orqali mavjud:
  ```
  GET /files/image.jpg
  ```

---

## 🧪 Test

```bash
# Unit testlar
npm run test

# Test coverage
npm run test:cov

# E2E testlar
npm run test:e2e
```

---

## 👨‍💻 Muallif

Bu loyiha **o'quv maqsadida** yaratilgan — NestJS, Prisma, PostgreSQL va JWT bilan to'liq backend tizim qurish amaliyoti uchun.

---

> **Port:** `3000` (standart) | **API prefix:** `/api/v1` | **Swagger:** `/swagger`
