# Ferma Pro - Dark Theme va Premium Dashboard Rejasi

Foydalanuvchi interfeysini qorong'u (Dark) rejimga o'tkazish, Dashboard'ni yangilash va tizimga qanday qo'shimchalar kiritish/olib tashlash bo'yicha takliflar:

## Tizimga qanday ma'lumotlar qo'shish va olib tashlash bo'yicha tavsiyalar:

### 🟢 Nimalarni qo'shish mumkin (Tavsiyalar):
1. **Harorat va Mikroiqlim nazorati**: Tovuqxona ichidagi harorat, namlik va ventilyatsiya holatini qismga qo'shish.
2. **Xodimlar va Ish xaqi**: Ferma ishchilari, ularning ishlagan soatlari va to'lovlarini yozib boruvchi alohida jadval.
3. **Qoldiqlar (Zaxira) nazorati**: Omborxonadagi yem va dorilar qoldig'ini foizlarda ko'rsatish (qachon tugashini bashorat qilish).

### 🔴 Nimalarni olib tashlash mumkin:
- Hozirgi "Dashboard" xaritalari juda eski va "oq" dizaynda qolgan. Uni to'liq yangilab, keraksiz sodda grafiklarni olib tashlaymiz. O'rniga faqat kerakli, foyda/zararning aniq hisobini ko'rsatuvchi interaktiv va animatsiyali diagrammalar qo'yamiz.

---

## Proposed Changes (Rejalashtirilgan O'zgarishlar)

Barcha sahifalarni qorong'u (Dark Mode) ko'rinishiga moslashtirish rejalashtirilmoqda.

### Bosh sahifa va Asosiy Qobiq (Dashboard & Layout)
#### [MODIFY] `Layout.jsx`
- Oq fonni to'q ko'k va qora gradient fonga o'zgartirish (`bg-[#0B1120]`).
- Barcha sahifalar uchun qorong'u rejim muhitini ta'minlash.

#### [MODIFY] `Dashboard.jsx`
- Rang-barang va mos kelmaydigan oq kartalarni zamonaviy "Glassmorphism" (shishasimon) qorong'u dizaynga o'tkazish.
- AI maslahatchisi uchun katta markaziy interaktiv panel.
- Ma'lumotlarni o'qish qulayligi uchun xiralashtirilgan fon va yorqin yozuvlar.

---

### Boshqa barcha modullar (Podalar, Tuxumlar, Yem va h.k.)
Sizga hozirgi grafiklarimiz yoqdimi (yaqinda yangilangan jadvallar)? Ammo ular hozir oq fonga moslashgan. Agar butunlay Dark dizayn xohlasangiz, barcha fayllardagi oq kadrlarni (`bg-white`) qorong'u tonlarga o'tkazishim kerak.

#### [MODIFY] `Flocks.jsx`, `Eggs.jsx`, `Feed.jsx`, `Health.jsx`, `Sales.jsx`, `Expenses.jsx`, `Reports.jsx`
- Jadval foni `bg-[#1E293B]` (To'q kukunrang/ko'k) ga o'tadi.
- Matnlar `text-gray-200` yoki `text-white` larga almashadi.
- Borderlar va hover effektlari neon ranglarda (Yashil, Kok, Pushti) ajralib turadigan qilinadi.

## Open Questions (Sizga Savollar)

> [!IMPORTANT]  
> 1. Dashboard'da aynan qaysi vizuallar (grafiklar, jadvallar) sizga ko'proq foydali? Ehtimol, faqat AI maslahatlari va "Sof foyda" (Profit) kartalariga e'tibor qaratish kerakdir?
> 2. Jadvallar (Podalar, Tuxum va h.k) ham qorong'u dizaynga (Dark Mode) birgalikda o'zgartirilsinmi yoki ular shundayligicha qolsinmi? Umumiy sayt Dark bo'lishi uchun ularni ham o'zgartirishni taklif qilaman. 
> 3. Qaysi modullarni (masalan, kadrlar, omborxona) keyingi safar tizimga umuman qo'shishimiz kerak? Hozirgi imkoniyatlardan nimanidir keraksiz deb o'ylaysizmi?

## Verification Plan
1. `Dashboard` sahifasi qayta yoziladi va barcha grafiklar qorong'u rejimga sozlanadi.
2. Responsiv (mobilda ko'rish) yaxshilanadi, elementlar mobil qurilmada ixchamlashadi.
3. Loyiha muvaffaqiyatli saqlanadi va GithUb orqali tarmoqqa yuklanadi.
