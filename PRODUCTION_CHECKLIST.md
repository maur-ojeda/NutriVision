# PRODUCTION DEPLOYMENT CHECKLIST

## Quick Setup for Vercel Production

### 🔴 CONFIGURACIÓN SUPABASE (CRÍTICO)

**URL de Producción:**
```
https://project-dzdkd.vercel.app
```

**Ir a Supabase Dashboard:**
1. https://supabase.com/dashboard
2. Seleccionar proyecto: `fizakpelecbudzbjjnvx`
3. Authentication → URL Configuration

**Configurar exactamente:**

**Site URL:**
```
https://project-dzdkd.vercel.app
```

**Redirect URLs (todas estas 3):**
```
https://project-dzdkd.vercel.app/**
https://project-dzdkd.vercel.app/auth/callback
https://project-dzdkd.vercel.app
```

**Guardar cambios** → Botón Save

---

### 🟢 PREPARAR ARCHIVO .env

**Edita `.env` y descomenta la línea de producción:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://fizakpelecbudzbjjnvx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xlWiAIvpzl58PdE26UiqoQ_9MsVlcis

# Development Configuration
VITE_APP_URL=http://localhost:3000

# Production Configuration (descomentar esta línea)
VITE_APP_URL=https://project-dzdkd.vercel.app
```

**Importante:** Quita el `#` de la línea de producción y añade `#` a la de desarrollo.

---

### 🟢 DEPLOY EN VERCEL

**Opción 1: Usando CLI (Recomendado)**
```bash
vercel --prod
```

**Opción 2: Usando Vercel Dashboard**
1. Ve a https://vercel.com/dashboard
2. Add New Project
3. Importa tu repositorio Git
4. Configura environment variables:
   ```
   VITE_SUPABASE_URL=https://fizakpelecbudzbjjnvx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xlWiAIvpzl58PdE26UiqoQ_9MsVlcis
   VITE_APP_URL=https://project-dzdkd.vercel.app
   ```
5. Deploy

---

## ✅ VERIFICAR DESPUÉS DEPLOY

1. **Visit:** https://project-dzdkd.vercel.app
2. **Probar Magic Link:**
   - Ingresa tu email
   - Haz clic en el link del email
   - Deberías ser redirigido automáticamente al dashboard

3. **Probar PWA:**
   - Android: Debería aparecer prompt de instalación
   - iOS: Share → Add to Home Screen
   - Desktop: Icono de instalación en barra de direcciones

---

## 📋 CHECKLIST FINAL

### Antes de Deploy:
- [ ] `.env` configurado para producción
- [ ] Build funciona localmente (`npm run build`)
- [ ] Supabase Redirect URLs configuradas correctamente
- [ ] No hay errores en consola localmente

### Después de Deploy:
- [ ] App carga en https://project-dzdkd.vercel.app
- [ ] Magic links funcionan correctamente
- [ ] PWA se puede instalar en Android/iOS
- [ ] No hay errores en consola
- [ ] PWA funciona offline

### Supabase Configuración:
- [ ] Site URL: `https://project-dzdkd.vercel.app`
- [ ] Redirect URL 1: `https://project-dzdkd.vercel.app/**`
- [ ] Redirect URL 2: `https://project-dzdkd.vercel.app/auth/callback`
- [ ] Redirect URL 3: `https://project-dzdkd.vercel.app`

---

## 🔧 TROUBLESHOOTING

### Magic links no funcionan en producción:
1. Verifica que las Redirect URLs coincidan exactamente
2. Chequea que `VITE_APP_URL` esté configurada en Vercel
3. Limpia caché del navegador
4. Revisa la consola del navegador por errores

### PWA no se instala:
1. Verifica que HTTPS esté funcionando
2. Chequea que manifest.webmanifest sea accesible
3. Limpia caché del navegador
4. Intenta en incognito/private window

### Errores de CORS:
1. Verifica configuración de CORS en Supabase
2. Asegura que el dominio de producción esté whitelist
3. Chequea que `VITE_SUPABASE_URL` sea correcta

---

## 📚 DOCUMENTACIÓN COMPLETA

- `VERCEL_DEPLOYMENT.md` - Guía detallada de deployment
- `FIX_MAGIC_LINK.md` - Configuración de magic links
- `PWA_INSTALLATION.md` - Guía de instalación de PWA
- `docs/PWA_CONFIGURATION.md` - Configuración técnica de PWA

---

## 🚀 COMANDOS ÚTILES

```bash
# Verificar build local
npm run build

# Deploy a producción
vercel --prod

# Login a Vercel
vercel login

# Verificar variables de entorno en Vercel
vercel env ls
```

---

*Última actualización: 14 de marzo de 2026*
*URL de producción: https://project-dzdkd.vercel.app*