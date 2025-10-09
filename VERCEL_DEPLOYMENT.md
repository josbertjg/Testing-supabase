# 🚀 Guía de Deployment en Vercel

## 🚨 Error que Estabas Teniendo

```
sh: line 1: tsc: command not found
ELIFECYCLE Command failed.
WARN Local package.json exists, but node_modules missing
Error: Command "pnpm build" exited with 1
```

### Causa del Error

Vercel estaba ejecutando `pnpm build` **sin instalar las dependencias primero**, por lo que TypeScript (`tsc`) no existía.

---

## ✅ Solución Implementada

### 1. Archivo `vercel.json` Creado

```json
{
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Qué hace:**

- ✅ Instala dependencias ANTES de compilar
- ✅ Especifica que la salida está en `dist/`
- ✅ Configura rewrites para SPA routing
- ✅ Optimiza cache para assets

### 2. Archivo `public/_redirects` Creado

```
/* /index.html 200
```

**Qué hace:**

- ✅ Redirige todas las rutas a `index.html` (necesario para React Router)
- ✅ Evita errores 404 al recargar páginas

---

## 🔧 Configuración en Vercel Dashboard

### Variables de Entorno

Debes agregar las variables de entorno en Vercel:

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. **Agrega estas variables:**

```
Name: VITE_SUPABASE_URL
Value: https://fynzhfrffhegquakmsiz.supabase.co
Environment: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bnpoZnJmZmhlZ3F1YWttc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDMwMjAsImV4cCI6MjA3NTAxOTAyMH0.iOuL9AmwrMXxKJulKdqKQU4lVmMzsjXtg0fe24dwa64
Environment: Production, Preview, Development
```

**Importante:**

- ✅ Usa el mismo nombre que en `.env` local
- ✅ Incluye el prefijo `VITE_`
- ✅ Marca todas las opciones de Environment

---

## 🌍 Configurar URL de Producción en Supabase

Después del primer deploy exitoso:

### 1. Obtén tu URL de Vercel

```
https://tu-app.vercel.app
```

### 2. Agrégala en Supabase

**Authentication** → **URL Configuration** → **Redirect URLs**

```
https://tu-app.vercel.app/**
https://tu-app.vercel.app
```

### 3. Actualiza Google Cloud Console

**Credentials** → **OAuth 2.0 Client IDs** → **Authorized redirect URIs**

```
https://fynzhfrffhegquakmsiz.supabase.co/auth/v1/callback
https://tu-app.vercel.app
https://tu-app.vercel.app/**
```

**Authorized JavaScript origins**

```
https://tu-app.vercel.app
```

---

## 🚀 Pasos para Deployar

### Opción 1: Desde GitHub (Recomendado)

1. **Push tu código a GitHub**

   ```bash
   git add .
   git commit -m "Configuración de Vercel y variables de entorno"
   git push origin master
   ```

2. **Importa en Vercel**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Vite
   - Agrega las variables de entorno
   - Deploy!

### Opción 2: Desde Vercel CLI

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Sigue las instrucciones interactivas
```

---

## 📋 Checklist de Deployment

### Antes del Deploy

- [x] `vercel.json` creado
- [x] `public/_redirects` creado
- [x] `.env` configurado localmente
- [ ] Variables de entorno agregadas en Vercel Dashboard
- [ ] Código pusheado a GitHub
- [ ] Proyecto conectado en Vercel

### Durante el Deploy

- [ ] Build exitoso (sin errores)
- [ ] Variables de entorno disponibles
- [ ] Assets compilados correctamente

### Después del Deploy

- [ ] URL de producción obtenida
- [ ] Redirect URLs actualizadas en Supabase
- [ ] Authorized URIs actualizadas en Google Cloud
- [ ] Probar login con email/password
- [ ] Probar login con Google OAuth
- [ ] Verificar routing (navegar a diferentes páginas)

---

## 🐛 Solución de Problemas Comunes

### Error: "tsc: command not found"

**Causa**: No se instalaron las dependencias

**Solución**:

```json
// vercel.json
{
  "buildCommand": "pnpm install && pnpm build"
}
```

✅ Ya implementado

### Error: "Cannot GET /patients"

**Causa**: Vercel no sabe que es una SPA y busca `/patients` como archivo físico

**Solución**:

```json
// vercel.json - rewrites
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

✅ Ya implementado

### Error: Variables de entorno undefined

**Causa**: No configuraste las variables en Vercel Dashboard

**Solución**:

1. Ve a Vercel Dashboard
2. Settings → Environment Variables
3. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Redeploy

### Error: Google OAuth no funciona en producción

**Causa**: URLs no configuradas

**Solución**:

1. Agrega tu URL de Vercel en Supabase Redirect URLs
2. Agrega tu URL de Vercel en Google Cloud Console
3. Espera 1-2 minutos para propagación

---

## 📊 Comandos de Build Explicados

### Localmente

```bash
npm run build
# = tsc -b && vite build
```

### En Vercel (ahora)

```bash
pnpm install          # ← Instala dependencias primero
pnpm build            # ← Luego ejecuta: tsc -b && vite build
```

---

## 🔍 Verificar el Deploy

### Logs de Vercel

Deberías ver algo así:

```
✓ Running "install" command: pnpm install
✓ 1743 modules transformed
✓ Building for production
✓ dist/index.html                    0.51 kB
✓ dist/assets/index-xxx.js         427.95 kB
✓ Build completed in 15s
✓ Deployment completed
```

---

## 🌐 URLs a Configurar Después del Deploy

Supongamos que tu URL de Vercel es: `https://testing-supabase.vercel.app`

### En Supabase Dashboard

**Authentication → URL Configuration**

```
Site URL:
https://testing-supabase.vercel.app

Redirect URLs:
https://testing-supabase.vercel.app/**
https://testing-supabase.vercel.app
http://localhost:5173/**
http://localhost:5173
```

### En Google Cloud Console

**OAuth 2.0 Client IDs → Authorized redirect URIs**

```
https://fynzhfrffhegquakmsiz.supabase.co/auth/v1/callback
https://testing-supabase.vercel.app
http://localhost:5173
```

**Authorized JavaScript origins**

```
https://testing-supabase.vercel.app
http://localhost:5173
```

---

## 🎯 Próximo Deploy

Una vez configurado todo:

1. **Haz cambios en tu código**
2. **Commit y push a GitHub**
   ```bash
   git add .
   git commit -m "Tu mensaje"
   git push
   ```
3. **Vercel auto-deploya** 🚀
4. **Listo en ~30 segundos**

---

## ✅ Archivos Creados para Vercel

```
Root:
├── vercel.json           ← Configuración de Vercel
└── public/
    └── _redirects        ← Redirects para SPA routing
```

---

## 🎉 ¡Listo para Deployar!

Ahora haz:

```bash
git add .
git commit -m "Configurar Vercel deployment"
git push origin master
```

Y en Vercel Dashboard:

1. Agrega las variables de entorno
2. Haz redeploy
3. **¡Debería funcionar!** 🚀

---

## 📞 Si Aún Falla

Compárteme:

1. El nuevo log de deployment de Vercel
2. Captura de tus variables de entorno en Vercel
3. Te ayudo a debuggear específicamente
