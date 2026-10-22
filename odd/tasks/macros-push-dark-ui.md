# NutriVision — Macros + Push Notifications + Dark UI

Branch: feat/macros-push-dark-ui  
Strategy: ask-on-risk  
Runner: `npm run build` (build check) / `npm run dev` (QA manual)  
Forecast: ~1200 authored lines

## Specs

S1 — Calculadora de macros con Mifflin-St Jeor como fórmula base. Si el usuario provee % de grasa corporal, usar Katch-McArdle automáticamente.

S2 — Onboarding al primer login: capturar peso (kg), altura (cm), edad, sexo (hombre/mujer), nivel de actividad (sedentario/ligero/moderado/activo/muy activo), objetivo (volumen/mantenimiento/definición), % grasa corporal (opcional).

S3 — Ajuste de macros por objetivo:
- Volumen: TDEE + 15%, proteína 2.0g/kg, carbos 4-6g/kg, grasas 1g/kg
- Mantenimiento: TDEE, proteína 1.8g/kg, carbos 3-5g/kg, grasas 0.8g/kg
- Definición: TDEE − 20%, proteína 2.2g/kg, carbos 2-4g/kg, grasas 0.8g/kg

S4 — El objetivo calórico diario deja de ser el hardcoded `CALORIE_GOAL = 2000` y pasa a ser el TDEE calculado del perfil del usuario.

S5 — Servidor de push notifications en Node.js desplegado en Dokploy como `push.mojeda.site`. VAPID keys como env vars. Endpoints: `POST /subscribe`, `POST /notify/:userId`, `DELETE /subscribe`.

S6 — Al guardar una comida, si las calorías del día alcanzan ≥95% del objetivo → notificación push "Te quedan ~X kcal para hoy". Si superan 100% → "Superaste tu objetivo diario".

S7 — UI dark estilo openGym: fondo negro puro (#000), cards #1a1a1a, acento verde #22c55e, typography grande para números clave, bottom navigation bar (Home / Stats / Perfil) con botón central cámara verde.

## Tasks

- [ ] T1 — S2,S4 — migración DB: tabla `user_profiles` + tabla `push_subscriptions` — inline — pending
- [ ] T2 — S5 — push server Node.js (`push-server/`) — inline — pending
- [ ] T3 — S1,S2,S3,S4 — lógica TDEE + onboarding UI + hook `useUserProfile` — inline — pending
- [ ] T4 — S5,S6 — integración push client: SW, subscribe, trigger al guardar comida — inline — pending
- [ ] T5 — S7 — UI dark redesign: todos los componentes + bottom nav — inline — pending

## Log

L1 — "calculadora de macros necesarios creo que hay distintos tipos, ya sea para volumen, mantenimiento y definicion, y alerta de calorias consumidas, por ejemplo si ya estas pasado o te quedan 5 % del total diario, puede ser notificacion push? y un cambio de ui me gusta algo como https://github.com/DuarteSantos8/openGym"
L2 — Fórmula aprobada: Mifflin-St Jeor con upgrade automático a Katch-McArdle si usuario provee % grasa corporal.
L3 — Push server aprobado en Dokploy como app Node.js separada en `push-server/` dentro del mismo repo.
