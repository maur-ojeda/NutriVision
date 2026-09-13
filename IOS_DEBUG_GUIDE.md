# DEPURACIÓN DE IOS PWA - INSTRUCCIONES PASO A PASO

## 🎯 PROBLEMA REPORTADO
- ✅ Instalación iOS PWA: Exitosa
- ✅ Solicitud de Magic Link: Exitosa  
- ✅ Email recibido y confirmado: Exitoso
- ✅ Clic en el enlace del email: Exitoso
- ✅ Redirección a https://project-dzdkd.vercel.app: Exitosa
- ❌ Login al dashboard en la PWA: Fallando

---

## 🔍 PASO 1: ACTIVAR DEBUGGING EN IOS PWA

### Método A: Usando Safari Web Inspector (Mac)

**Requisitos:**
- Mac conectado al mismo WiFi que el iPhone/iPad
- Safari en Mac
- iPhone/iPad conectado por USB

**Pasos:**
1. **Conectar dispositivo** a Mac usando USB
2. **Abrir Safari** en Mac
3. **Habilitar Develop menu** en Safari Preferences → Advanced → "Show Develop menu in menu bar"
4. **Abrir iOS PWA** en el dispositivo
5. **En Safari Mac**: Develop → [Nombre del iPhone] → [Nombre del PWA]
6. **Ver Console**: Click en Console tab

**Ver logs cuando hagas clic en el magic link:**
```
HomePage: Detectando parámetros de URL...
HomePage: Parámetros detectados: { accessToken: "...", ... }
HomePage: Mostrando AuthCallback
useAuth: Iniciando detección de sesión...
```

### Método B: Usando Console Integrado (En iOS PWA)

**Nota**: iOS no tiene una forma fácil de ver console logs, pero puedes usar una librería de logging.

**Si no puedes conectar a Mac:**
1. La app ahora tiene **console.log** mejorados
2. Busca errores visuales en la interfaz
3. Verifica si AuthCallback muestra diferentes estados
4. Revisa si hay mensajes de error visibles

---

## 🔍 PASO 2: VERIFICAR URL DEL MAGIC LINK

### Cuando hagas clic en el magic link, la URL debería ser:

**Correcto:**
```
https://project-dzdkd.vercel.app/#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&expires_in=3600&refresh_token=...&token_type=bearer
```

**Incorrecto:**
```
https://project-dzdkd.vercel.app/ (sin parámetros)
https://project-dzdkd.vercel.app/?error=... (con error)
```

**Clave**: Los parámetros deben venir en **hash (#)**, no en search (?)

---

## 🔍 PASO 3: REINSTALAR PWA IOS (SOLUCIÓN RÁPIDA)

### Si los logs no ayudan, prueba reinstalar:

1. **Borrar PWA existente**:
   - Mantén presionado el icono de NutriVision en home screen
   - Click en "Remove App" o similar
   - Confirma que quieras borrar

2. **Limpiar Safari**:
   - Abrir Safari (no la PWA)
   - Ir a Settings → Safari → Clear History and Website Data
   - Click "Clear History and Data"

3. **Reinstalar PWA**:
   - Abrir Safari
   - Ir a https://project-dzdkd.vercel.app
   - Share → Add to Home Screen
   - Acepta instalar

4. **Probar Magic Link de nuevo**:
   - Ingresa tu email en la PWA reinstalada
   - Recibe email
   - Haz clic en el link
   - Deberías ser redirigido automáticamente al dashboard

---

## 🔍 PASO 4: PROBAR DIFERENTES ESCENARIOS

### Escenario A: Desde Safari Primero

1. **En lugar de abrir link directamente en email**, ábrelo en Safari normal
2. Verifica si te loguea en Safari
3. Si funciona en Safari, entonces abre la PWA desde home screen
4. Verifica si la sesión persistió

### Escenario B: Desde Diferentes Clientes de Email

Prueba el magic link desde:
- **Gmail app** (si usas Gmail)
- **Apple Mail** (mail nativo de iOS)
- **Outlook** (si usas Exchange)
- **Webmail** (abriendo el email en Safari)

### Escenario C: En Modo Incógnito

1. **Abre Safari** en modo Private
2. Navega a https://project-dzdkd.vercel.app
3. Request magic link
4. Haz clic en el link
5. Verifica si funciona mejor sin caché

---

## 🔍 PASO 5: VERIFICAR CONFIGURACIÓN DE SUPABASE

### URLs DEBEN COINCIDIR EXACTAMENTE:

**En Supabase Dashboard → Authentication → URL Configuration:**

```
Site URL:
https://project-dzdkd.vercel.app

Redirect URLs (estas 3 exactamente):
https://project-dzdkd.vercel.app/**
https://project-dzdkd.vercel.app/auth/callback
https://project-dzdkd.vercel.app
```

### Si las URLs están correctas:

1. **Guarda cambios** en Supabase
2. **Espera 1-2 minutos** para que se propague
3. **Borra caché del navegador**
4. **Prueba de nuevo** el magic link

---

## 🔍 PASO 6: VERIFICAR PERMISOS IOS

### iOS PWA Requiere:

- ✅ **Acceso a Safari**: La PWA usa Safari como base
- ✅ **Storage Permitido**: La app necesita guardar cookies/sesión
- ✅ **Sin restricciones de content blocking**: Algunas apps pueden bloquear scripts

### Para verificar permisos:

1. **Settings → General → iPhone Storage**
2. Busca "NutriVision"
3. Toca la app
4. Verifica que tenga permisos necesarios
5. Si hay restricciones, ajustarlas

---

## 🔍 PASO 7: COMPROBAR ERRORES VISUALES EN LA PWA

### Qué buscar en AuthCallback:

**Estado Loading (deberías ver esto primero):**
- Spinner girando 🔄
- "Procesando tu enlace..."
- "Procesando sesión. Esto puede tomar unos segundos..."

**Estado Success (si funciona):**
- Check verde ✅
- "¡Sesión establecida correctamente!"
- "¡Proceso completado!"
- Deberías ser redirigido automáticamente

**Estado Error (si hay problemas):**
- X roja ❌
- Mensaje de error específico
- "Error de autenticación"
- "Serás redirigido a la página de inicio en unos segundos"

---

## 🔍 PASO 8: SOLUCIONES ALTERNATIVAS

### Si nada funciona, prueba estas soluciones:

#### Solución 1: Usar Magic Link en Safari
1. Abre el link del email en **Safari** (no en PWA)
2. Verifica si te loguea correctamente
3. Si funciona, abre la **PWA desde home screen**
4. La sesión debería persistir

#### Solución 2: Desinstalar y Reinstalar PWA
1. Borra la PWA de home screen
2. Limpia Safari completamente
3. Reinstala PWA desde Safari
4. Prueba el magic link de nuevo

#### Solución 3: Usar Incógnito
1. Abre la app en modo Private
2. Navega a la URL de producción
3. Request magic link
4. Haz clic en el link
5. Verifica si funciona sin caché/cookies viejos

---

## 📋 CHECKLIST PARA TIEMPOS DE DEBUGGING

### Antes de Empezar:
- [ ] Tiene Mac con Safari para conectar debugging
- [ ] Tiene cable USB para conectar dispositivo
- [ ] URLs de Supabase están configuradas correctamente
- [ ] App de producción está deployada en Vercel

### Durante Debugging:
- [ ] Console logs activos y visibles
- [ ] URL del magic link tiene parámetros correctos
- [ ] AuthCallback muestra estado esperado
- [ ] No hay errores CORS en console
- [ ] Session establishment se ve en logs

### Si Funciona:
- [ ] Usuario es redirigido automáticamente al dashboard
- [ ] Session persiste en PWA
- [ ] Dashboard muestra datos del usuario
- [ ] No hay errores en console

### Si No Funciona:
- [ ] Captura screenshots de console logs
- [ ] Nota la URL exacta del magic link
- [ ] Verifica Supabase logs en dashboard
- [ ] Prueba soluciones alternativas documentadas

---

## 🚨 SEÑALES DE ALERTA

### Cuándo Contactar a Soporte:

**Si después de probar todo esto:**
- No hay logs de console visibles
- Magic link nunca muestra parámetros detectados
- AuthCallback siempre muestra estado de error
- Ninguna de las soluciones alternativas funciona

**Entonces:**
1. Captura screenshots de console
2. Nota la URL exacta del magic link
3. Verifica Supabase logs en dashboard
4. Reporta el problema con toda esta información

---

## 📱 HERRAMIENTAS DE DEBUGGING PARA IOS

### iOS Simulator (si tienes Mac):
```bash
# Instalar Xcode (si no lo tienes)
# Abrir Xcode → Open Developer Tool → Simulator
# Abrir Safari en el simulator
# Navegar a la app de producción
# Usar Safari → Develop → Simulator para ver console
```

### Safari Web Inspector:
- **Shortcut**: Cmd + Option + I (en Mac)
- **Acceso**: Develop → [Nombre del dispositivo]
- **Features**: Console, Network, Storage, Elements

---

## 🎯 RESULTADO ESPERADO

### Cuando Funciona Correctamente:

1. **Usuario hace clic en magic link en email**
2. **PWA se abre** con AuthCallback visible
3. **Console logs muestran**:
   ```
   HomePage: Parámetros detectados: { accessToken: "...", ... }
   useAuth: Auth state changed: SIGNED_IN
   ```
4. **AuthCallback muestra**: "¡Sesión establecida correctamente!" ✅
5. **Redirección automática** al dashboard después de 2 segundos
6. **Dashboard muestra** con usuario autenticado
7. **Session persiste** al cerrar y reabrir la app

---

*Última actualización: 14 de marzo de 2026*
*Plataforma: iOS PWA*
*Versión: Producción (Vercel)*
*Estatus: Depuración en progreso*