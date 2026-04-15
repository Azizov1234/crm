# ACADEMY SUPERADMIN PANEL — CODEx FRONTEND PROMPT

Quyidagi promptni Codex yoki boshqa coding modelga bering. Bu prompt men yuborgan screenshotlar dizayniga maksimal yaqin frontend yozish uchun tayyorlangan.

---

## SCREENSHOTLARDAN OLIB CHIQILGAN DIZAYN SISTEMASI

### Umumiy stil
- Juda clean admin panel
- Light background: och kulrang / och ko‘kimtir fon
- Chap sidebar oq rangga yaqin, ichki soyali va tartibli
- Yuqorida ingichka header bar
- Asosiy kontent markazda keng bloklarda
- Kartalar katta radiusli, yumshoq shadow bilan
- Ranglar professional va balansli
- Gradientlar asosan ko‘k → binafsha

### Sidebar
- Chap tomonda fixed sidebar
- Logo blok tepada
- Har bir menu item icon + text bilan
- Active menu item ko‘k/binafsha gradient va ichki glow bilan
- Menu bo‘limlari section label bilan ajratilgan:
  - AKADEMIYA
  - O‘QUV JARAYONI
  - NATIJALAR
  - BOSHQARUV
- Sidebar ichida accordion-style nested menu ham bor

### Header
- Tepada branch selector bor
- Til selector bor
- User avatar + ism + role bor
- Juda minimal, ortiqcha element yo‘q

### Page hero/header
- Har sahifada yuqorida uzun gradient banner card
- Chap tomonda sahifa iconi
- Sahifa title katta, oq yoki kontrastli
- Subtitle kichikroq
- O‘ng tomonda count/stat pill card bor

### Search va filter toolbar
- List page’larda search input chap tomonda
- Filter button va view toggle buttonlar o‘ng tomonda
- Create button gradient style bilan alohida ajralib turadi

### Empty states
- Katta oq card ichida bo‘sh holat illyustrativ icon bilan
- Katta title: “topilmadi” mazmunidagi text
- Kichik subtitle
- CTA button mavjud

### Modal design
- Modal katta radiusli
- Header qismi gradient ko‘k → binafsha
- Chap yuqori qismida plus/add icon aylana ichida
- O‘ng yuqorida close button aylana ichida
- Ichki qismlar section-step ko‘rinishida:
  - 1
  - 2
  - 3
- Har section nomi va ingichka divider bilan ajratilgan
- Form inputlar yumshoq borderli, oq fonli
- Inputlar 2 ustunli gridda joylashgan
- Bottomda to‘liq enli gradient submit button bor

### Buttonlar
- Asosiy button: ko‘k → binafsha gradient
- Secondary button: oq fon, border bilan
- Utility chip/buttonlar pastel ranglarda

### Cardlar
- Stats card oq fonda
- O‘ng tarafda rangli icon box
- Dashboard stats ranglarga bo‘lingan
- Payments sahifasida rangli summary cards alohida kuchli ko‘rinishda

### Dashboard
- 6 ta stats card
- Quick action bar gradient fonda
- Chart cardlar keng, oq fonli
- O‘ng tomonda gender va top natijalar bloklari
- Layout muvozanatli grid ko‘rinishda

### Attendance page
- Och yashilga yaqin umumiy fon aksenti
- Stats cardlar statusga qarab ranglangan
- Chart block va yon side summary block bor
- Table filter chips bilan ishlaydi

### Payments page
- Tepada rangli summary cards:
  - yashil
  - sariq/orange
  - qizil/pink
  - to‘q ko‘k
- Pastda search va status chip filterlar
- Empty state katta oq card ichida

### Settings page
- Katta oq settings card
- Logo upload bloki bor
- Save button o‘ng tomonda
- Pastda filiallarni boshqarish cardi bor

### Form sahifalaridagi asosiy modal sectionlar
- Students:
  - shaxsiy ma’lumot
  - ota-ona / vasiy
  - profil rasmi
  - guruhlarga biriktirish
- Teachers:
  - shaxsiy ma’lumot
  - profil rasmi
- Parents:
  - ota-ona / vasiy ma’lumotlari
  - o‘quvchini biriktirish
- Admins:
  - shaxsiy ma’lumot
  - rol
  - mavjud userga bog‘lash
- Groups:
  - guruh tafsilotlari
  - dars tafsilotlari
  - a’zolar
- Rooms:
  - xona tafsilotlari
- Courses:
  - kurs haqida ma’lumot
- Timetable:
  - dars tafsilotlari
  - kunlarni tanlash

---

## TO‘LIQ PROMPT

```txt
Sen senior frontend engineer va UI systems specialist sifatida ishlaysan.

Menga ACADEMY SUPERADMIN PANEL uchun productionga yaqin frontend yozib ber.

MUHIM:
- Men yuborgan screenshotlar qat’iy visual reference hisoblanadi.
- Dizayn screenshotlarga maksimal darajada o‘xshashi kerak.
- Ayniqsa quyidagilarni aniq ushla:
  - chap sidebar uslubi
  - yuqori header
  - gradient hero banners
  - search + filter toolbar
  - empty state cardlar
  - create/edit modal dizayni
  - step sectionlar
  - full-width gradient action buttons
  - stats cardlar va ranglar
- Dizayn clean, premium, professional admin panel bo‘lsin.
- Oqartirilgan, soft, zamonaviy dashboard estetikasi bo‘lsin.
- UI haddan tashqari rangli bo‘lmasin.
- Screenshotdagi spacing, radius, shadow va hierarchy saqlansin.

STACK:
- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- Axios
- Lucide-react
- Recharts

LOIHA TURI:
- Bu academy uchun SUPERADMIN / ADMIN boshqaruv paneli.
- Bu student panel emas.
- Bu teacher panel emas.
- Bu staff self-service panel emas.

PRISMA MANTIQI:
- Organization = academy
- Branch = filial
- User = umumiy account
- AdminProfile, TeacherProfile, StudentProfile, ParentProfile, StaffProfile = role-specific profillar
- ParentStudent = parent-student bog‘lanishi
- GroupStudent = group-student bog‘lanishi
- Course, Room, Group, Timetable, Attendance, StaffAttendance, Rating = akademik modullar
- Payment, PaymentHistory, Expense, TariffPlan, Subscription = moliya va tarif modullari
- SmsLog, SmsTemplate, ActionLog, ErrorLog = tizim modullari
- Soft delete status bilan ishlaydi: ACTIVE, INACTIVE, ARCHIVED, DELETED

SCREENSHOTDAN OLINADIGAN MAJBURIY DIZAYN QOIDALARI:
- Sidebar oq fonli, minimal, icon + text bilan
- Active menu blue/purple gradient bilan highlight bo‘lsin
- Page top hero banner blue-to-purple gradient bo‘lsin
- Hero ichida page icon, title, subtitle va o‘ng tomonda stat pill bo‘lsin
- Search panel katta yumshoq white toolbar ichida bo‘lsin
- Create button gradient va rounded bo‘lsin
- Modal header gradient bo‘lsin
- Modal sectionlar raqamli badge bilan ajratilsin
- Formlar 2 ustunli gridda bo‘lsin
- Inputlar yumshoq border va katta radius bilan bo‘lsin
- Submit button modal pastida full-width gradient bo‘lsin
- Dashboard stats cardlar oq fonda, rangli icon container bilan bo‘lsin
- Payments cards rangli bo‘lsin
- Attendance page soft green tint bilan bo‘lsin
- Settings cardlari structured bo‘lsin

ROUTELAR:
- /dashboard
- /teachers
- /students
- /parents
- /admins
- /groups
- /rooms
- /courses
- /timetable
- /attendance
- /staff-attendance
- /ratings
- /payments
- /settings
- /branches
- /tariffs
- /sms
- /finance
- /action-logs
- /error-logs

PAGELAR UCHUN UI TALABLAR:

1) Dashboard
- 6 ta stats card
- quick actions gradient bar
- attendance chart card
- gender taqsimoti side card
- oylik tushum card
- eng yaxshi natijalar card

2) Teachers
- hero banner
- search bar
- filter button
- grid/list toggle
- create modal
- empty state

3) Students
- teachers page uslubida
- create modal ichida:
  - shaxsiy ma’lumot
  - ota-ona / vasiy
  - profil rasmi
  - guruhlarga biriktirish

4) Parents
- create modal ichida:
  - ota-ona / vasiy ma’lumotlari
  - o‘quvchini biriktirish

5) Admins
- create modal ichida:
  - shaxsiy ma’lumot
  - rol
  - sms orqali kirish ma’lumoti yuborish
  - mavjud userga bog‘lash

6) Groups
- create modal ichida:
  - guruh tafsilotlari
  - dars tafsilotlari
  - a’zolar

7) Rooms
- create modal:
  - xona
  - sig‘imi

8) Courses
- create modal:
  - kurs
  - tavsif
  - narx

9) Timetable
- create modal:
  - group
  - room
  - start time
  - end time
  - weekdays chips/selectors

10) Attendance
- soft green dashboard
- attendance stats
- chart
- filter chips
- data table

11) Staff Attendance
- attendance page stilida, lekin staff uchun

12) Ratings
- ranking / table / filter

13) Payments
- 4 ta rangli summary card
- search
- status pills
- empty state
- payment list / drawer / history

14) Settings
- organization details card
- logo upload
- save button
- branches management card

15) Branches
- list + modal CRUD

16) Tariffs
- plan cards
- current subscription block

17) SMS
- send sms form
- bulk send
- template list
- logs table

18) Finance
- expense summary
- expense list
- cashflow chart

19) Action Logs
- readonly table
- filters
- detail drawer

20) Error Logs
- readonly table
- statusCode, path, method, message
- detail drawer

API INTEGRATION:
Har bir page real backend API bilan ishlashga tayyor bo‘lsin.
Axios instance:
- baseURL
- bearer token interceptor
- x-branch-id header
- error interceptor

SERVICES FILELARI:
- dashboard.service.ts
- teachers.service.ts
- students.service.ts
- parents.service.ts
- admins.service.ts
- groups.service.ts
- rooms.service.ts
- courses.service.ts
- timetable.service.ts
- attendance.service.ts
- staffAttendance.service.ts
- ratings.service.ts
- payments.service.ts
- settings.service.ts
- branches.service.ts
- tariffs.service.ts
- sms.service.ts
- finance.service.ts
- logs.service.ts

STRUCTURE:
src/
  app/
    (dashboard)/
      dashboard/page.tsx
      teachers/page.tsx
      students/page.tsx
      parents/page.tsx
      admins/page.tsx
      groups/page.tsx
      rooms/page.tsx
      courses/page.tsx
      timetable/page.tsx
      attendance/page.tsx
      staff-attendance/page.tsx
      ratings/page.tsx
      payments/page.tsx
      settings/page.tsx
      branches/page.tsx
      tariffs/page.tsx
      sms/page.tsx
      finance/page.tsx
      action-logs/page.tsx
      error-logs/page.tsx
      layout.tsx
  components/
    layout/
    shared/
    forms/
    charts/
  services/
  hooks/
  lib/
  types/

COMPONENTLAR:
- Sidebar
- Header
- AppShell
- PageHero
- StatsCard
- SearchToolbar
- DataTable
- StatusBadge
- EmptyState
- ModalShell
- StepSection
- FormInput
- FormSelect
- FileUpload
- GradientButton
- Pagination

BACKEND ENTITYLARGA MOS PAGE LOGIKASI:
- Teachers → User + TeacherProfile
- Students → User + StudentProfile + ParentStudent + GroupStudent
- Parents → User + ParentProfile + ParentStudent
- Admins → User + AdminProfile
- Groups → Group + Course + Room + TeacherProfile + GroupStudent
- Rooms → Room
- Courses → Course
- Timetable → Timetable + Group + Room
- Attendance → Attendance + StudentProfile + Group
- Staff Attendance → StaffAttendance + StaffProfile
- Ratings → Rating
- Payments → Payment + PaymentHistory
- Settings → Organization + OrganizationSetting
- Branches → Branch
- Tariffs → TariffPlan + Subscription
- SMS → SmsLog + SmsTemplate
- Finance → Expense + Payment summary
- Logs → ActionLog + ErrorLog

OUTPUT FORMAT:
1. Avval design systemni qisqa tahlil qil
2. Keyin project structure yoz
3. Keyin layout komponentlarini yoz
4. Keyin dashboard page to‘liq yoz
5. Keyin reusable componentlarni yoz
6. Keyin teachers, students, groups, payments, settings, attendance page’larni to‘liq yoz
7. Keyin qolgan page skeletonlarni yoz
8. Keyin services yoz
9. Keyin setup instructions yoz

MUHIM CODING QOIDALARI:
- TypeScript strict friendly bo‘lsin
- componentlar reusable bo‘lsin
- Tailwind classlar tartibli bo‘lsin
- fake data ishlatma
- API-ready qil
- shadcn/ui bilan professional component architecture qil
- modal dizayni screenshotga juda yaqin bo‘lsin
- kerak bo‘lsa ishni bir necha bosqichga bo‘lib yoz

Avval screenshotlarning visual language’ini tahlil qil, keyin kod yoz.
```

---

## QISQA VERSIYA PROMPT

```txt
Menga Next.js App Router + TypeScript + Tailwind + shadcn/ui asosida ACADEMY SUPERADMIN PANEL frontend yozib ber.

Men yuborgan screenshotlar qat’iy visual reference. Dizayn ayniqsa quyidagilarga juda o‘xshashi kerak:
- chap sidebar
- top header
- ko‘k-binafsha gradient page hero
- oq soft shadowli cardlar
- search/filter toolbar
- empty state cardlar
- create/edit modal dizayni
- modal ichidagi numbered step sectionlar
- full width gradient submit buttonlar

Bu panel Prisma entitylariga mos bo‘lsin:
Organization, Branch, User, AdminProfile, TeacherProfile, StudentProfile, ParentProfile, StaffProfile, ParentStudent, GroupStudent, Course, Room, Group, Timetable, Attendance, StaffAttendance, Rating, Payment, PaymentHistory, Expense, TariffPlan, Subscription, SmsLog, SmsTemplate, ActionLog, ErrorLog.

Route lar:
/dashboard
/teachers
/students
/parents
/admins
/groups
/rooms
/courses
/timetable
/attendance
/staff-attendance
/ratings
/payments
/settings
/branches
/tariffs
/sms
/finance
/action-logs
/error-logs

API-ready bo‘lsin. Axios services yozilsin. Reusable components ishlatilsin. Teachers, Students, Groups, Payments, Settings, Attendance, Dashboard page’lar to‘liq yozilsin. Qolganlariga skeleton berilsin.

Kodlar productionga yaqin, copy-paste qilsa ishlaydigan bo‘lsin.
```

---

VISUAL REFERENCE (MUHIM):

Men barcha dizayn screenshotlarni loyiha ichiga joyladim:

/src/images/

Bu papkada quyidagi fayllar bor:
- dashboard.png
- teachers.png
- students.png
- parents.png
- groups.png
- rooms.png
- courses.png
- timetable.png
- attendance.png
- staff-attendance.png
- payments.png
- settings.png
- admins.png

SHART:
- Shu rasmlarni asosiy design source sifatida ishlat
- UI ni aynan shu rasmlarga maksimal darajada o‘xshat
- Ranglar, spacing, border radius, shadow, button style, modal style — hammasi shu rasmlardan olinadi
- O‘zing yangi design o‘ylab topma
- Tailwind orqali aynan shu ko‘rinishni qayta tikla

MUHIM QOIDALAR:
- Sidebar width va active holati rasmdagi kabi bo‘lsin
- Header gradient ranglari aynan rasmdagidek bo‘lsin (blue → purple)
- Modal design:
  - yuqorisi gradient header
  - body oq fon
  - rounded-xl yoki 2xl
  - shadow-lg
- Inputlar:
  - yumaloq (rounded-lg)
  - light border
  - focus state bo‘lsin
- Buttonlar:
  - primary gradient
  - hover effect
- Cardlar:
  - soft shadow
  - clean spacing
- Table:
  - minimal, clean, admin panel style

AGAR RASM BILAN KOD FARQ QILSA:
- HAR DOIM RASM TO‘G‘RI

## CODEx GA QO‘SHIMCHA BUYRUQ

Prompt boshiga mana buni ham yozib yubor:

```txt
First analyze the screenshots carefully and extract the visual system, spacing rhythm, card style, modal composition, and sidebar behavior before writing any code.
```

