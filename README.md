# Livecity Next

Сучасна версія системи моніторингу міського транспорту **Livecity**, переписана на стек:
- **Runtime:** Node.js (v24 / v26+)
- **Backend (`apps/api`):** NestJS 11 + `@nestjs/mongoose` (Mongoose 8, GeoJSON `2dsphere` індекси) + Socket.IO (`@nestjs/websockets`)
- **Frontend (`apps/web`):** React 19 + Vite + TypeScript + `@vis.gl/react-google-maps`
- **Shared (`packages/shared`):** Спільні DTO та типи між фронтендом і бекендом

## Ключові покращення порівняно з `livecity-server` (2014)

1. **Використання готових зупинок із Google Maps:**
   Замість ручного додавання кожної зупинки через `PointEditor`, ви можете клікнути прямо на існуючий значок зупинки 🚏 на карті Google Maps (`event.detail.placeId`). Фронтенд отримує назву й координати зупинки через Google Places API і автоматично реєструє/оновлює її через `POST /api/points/from-google-place`.
2. **Геопросторовий пошук через MongoDB `2dsphere`:**
   Замість завантаження всієї колекції зупинок у пам'ять і циклу з формулою Гаверсинуса (`Points.statics.findNear`), пошук найближчих зупинок виконується нативно у MongoDB через `$nearSphere`.
3. **WebSockets замість 2-секундного полінгу з перемальовуванням маркерів:**
   Бекенд транслює події `transport:updated` та `transport:removed` через `TransportGateway` (`socket.io`), а React оновлює позиції автобусів без мерехтіння карти.

## Швидкий старт

1. Запустіть локальну MongoDB:
   ```bash
   docker compose up -d
   ```
2. Скопіюйте змінні середовища:
   ```bash
   cp .env.example .env
   ```
3. Встановіть залежності:
   ```bash
   npm install
   ```
4. Запустіть бекенд та фронтенд:
   ```bash
   npm run dev:api
   npm run dev:web
   ```
