# 🚀 Deployment en Vercel - Paso a Paso

## 🎯 Problema Original

```
❌ sh: line 1: tsc: command not found
❌ ELIFECYCLE Command failed
❌ Local package.json exists, but node_modules missing
```

**Causa**: Vercel ejecutaba `pnpm build` sin instalar dependencias primero.

---

## ✅ Solución (Ya Implementada)

He creado 2 archivos que arreglan el problema:

### 1. `vercel.json`

Configura cómo Vercel debe compilar tu app:

```json
{
  "buildCommand": "pnpm install && pnpm build",  ← Instala ANTES de compilar
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }  ← Para React Router
  ]
}
```

### 2. `public/_redirects`

Fallback para routing de SPA:

```
/* /index.html 200
```

---

## 📋 Pasos para Deployar AHORA

### Paso 1: Sube los Archivos a GitHub

```bash
# 1. Verifica que vercel.json existe
ls vercel.json

# 2. Agrega todos los cambios
git add .

# 3. Commit
git commit -m "Configurar deployment en Vercel con variables de entorno"

# 4. Push a GitHub
git push origin master
```

### Paso 2: Configura Variables de Entorno en Vercel

1. **Ve a tu proyecto en Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Settings** → **Environment Variables**

3. **Agrega estas 2 variables:**

   **Primera variable:**

   ```
   Name: VITE_SUPABASE_URL
   Value: https://fynzhfrffhegquakmsiz.supabase.co
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

   **Segunda variable:**

   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bnpoZnJmZmhlZ3F1YWttc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDMwMjAsImV4cCI6MjA3NTAxOTAyMH0.iOuL9AmwrMXxKJulKdqKQU4lVmMzsjXtg0fe24dwa64
   ☑ Production
   ☑ Preview
   ☑ Development
   ```

4. **Guarda** las variables

### Paso 3: Redeploy

1. **Ve a Deployments** en Vercel
2. **Haz clic en "Redeploy"** en el último deployment
3. **O** simplemente haz push a GitHub de nuevo

### Paso 4: Espera el Build

Deberías ver:

```
✓ Running "install" command: pnpm install
✓ Installing dependencies...
✓ Running "build" command: pnpm build
✓ tsc -b                           ← Ya NO falla!
✓ vite build
✓ 1743 modules transformed
✓ Build completed
✓ Deployment ready
```

---

## 🌐 Después del Deploy Exitoso

### Obtendrás una URL como:

```
https://testing-supabase.vercel.app
```

### Configura esta URL en 2 lugares:

#### 1. Supabase Dashboard

**Authentication** → **URL Configuration**

```
Site URL:
https://testing-supabase.vercel.app

Redirect URLs:
https://testing-supabase.vercel.app/**
https://testing-supabase.vercel.app
http://localhost:5173/**
```

#### 2. Google Cloud Console

**Credentials** → **OAuth 2.0 Client IDs** → Tu Client ID

**Authorized redirect URIs:**

```
https://fynzhfrffhegquakmsiz.supabase.co/auth/v1/callback
https://testing-supabase.vercel.app
http://localhost:5173
```

**Authorized JavaScript origins:**

```
https://testing-supabase.vercel.app
http://localhost:5173
```

---

## 🧪 Probar la App en Producción

1. **Ve a tu URL de Vercel**

   ```
   https://testing-supabase.vercel.app/login
   ```

2. **Prueba Login con Email/Password**

   - Regístrate
   - Inicia sesión
   - Verifica que funcione

3. **Prueba Login con Google**

   - Haz clic en "Continuar con Google"
   - Autoriza
   - Verifica que redirija al dashboard

4. **Prueba Navegación**
   - Ve a /patients
   - Ve a /doctors
   - Recarga la página (no debería dar 404)

---

## 🔍 Verificar el Build

### Logs Correctos de Vercel

```
✓ Cloning repository
✓ Installing dependencies via pnpm
✓ Dependencies installed (15s)
✓ Running build command
✓ tsc -b                              ← TypeScript compila!
✓ vite build                          ← Vite compila!
✓ dist/index.html                     ← HTML generado
✓ dist/assets/index-xxx.js            ← JS bundle generado
✓ Build completed successfully (25s)
✓ Deploying build outputs
✓ Deployment ready at https://...
```

---

## 📦 Qué Incluye el Build

```
dist/
├── index.html                        ← Página principal
├── assets/
│   ├── index-xxx.js                  ← JavaScript bundle
│   ├── index-xxx.css                 ← CSS compilado
│   └── browser-xxx.js                ← Polyfills
└── vite.svg                          ← Assets públicos
```

---

## ⚙️ Configuración de Build en Vercel

### Build Settings (Auto-detectadas)

```
Framework Preset: Vite
Build Command: pnpm install && pnpm build
Output Directory: dist
Install Command: pnpm install
Development Command: pnpm dev
```

Si necesitas cambiar algo:
**Settings** → **Build & Development Settings**

---

## 🚨 Solución de Problemas

### Error: "tsc: command not found" (de nuevo)

**Solución**:

```bash
# Verifica que vercel.json tenga:
"buildCommand": "pnpm install && pnpm build"

# No solo:
"buildCommand": "pnpm build"
```

### Error: "Cannot GET /patients" en producción

**Solución**:

```bash
# Verifica que vercel.json tenga rewrites:
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### Error: Variables de entorno undefined

**Solución**:

1. Verifica que agregaste las variables en Vercel Dashboard
2. Verifica que tienen el prefijo `VITE_`
3. Redeploy después de agregar variables

### Error: Google OAuth no funciona en producción

**Solución**:

1. Agrega tu URL de Vercel en Google Cloud Console
2. Agrega tu URL de Vercel en Supabase Redirect URLs
3. Espera 2-3 minutos para propagación

---

## 🎯 Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUJO DE DEPLOYMENT                        │
└─────────────────────────────────────────────────────────────┘

1. Código Local
   ├── vercel.json creado          ✅
   ├── .env configurado             ✅
   └── Variables de entorno usadas  ✅
         ↓
2. Push a GitHub
   └── git push origin master       → Por hacer
         ↓
3. Vercel recibe Push
   ├── Clona repositorio
   ├── Lee vercel.json
   ├── Ejecuta: pnpm install        ← Instala dependencias
   ├── Ejecuta: pnpm build          ← Compila con TypeScript
   └── Genera dist/                 ← Build exitoso
         ↓
4. Configura Variables en Vercel Dashboard
   ├── VITE_SUPABASE_URL            → Por hacer
   └── VITE_SUPABASE_ANON_KEY       → Por hacer
         ↓
5. Redeploy
   └── Build exitoso                ✅
         ↓
6. URL de Producción
   └── https://tu-app.vercel.app
         ↓
7. Configura URLs
   ├── En Supabase                  → Por hacer
   └── En Google Cloud Console      → Por hacer
         ↓
8. ¡App funcionando en producción! 🎉
```

---

## ✅ Checklist Rápido

### Antes de Deployar

- [x] vercel.json creado
- [x] public/\_redirects creado
- [ ] Push a GitHub
- [ ] Variables en Vercel Dashboard

### Después del Primer Deploy

- [ ] Obtener URL de Vercel
- [ ] Configurar en Supabase
- [ ] Configurar en Google Cloud
- [ ] Probar en producción

---

## 🎉 Siguiente Paso

```bash
# 1. Agrega los archivos nuevos
git add vercel.json public/_redirects

# 2. Commit
git commit -m "Configurar Vercel deployment"

# 3. Push
git push origin master

# 4. Ve a Vercel Dashboard
# 5. Agrega variables de entorno
# 6. Redeploy
# 7. ¡Listo! 🚀
```

---

## 📞 Ayuda Adicional

Si el build falla de nuevo, compárteme:

1. **Logs completos de Vercel** (copia todo el log)
2. **Captura de Environment Variables en Vercel**
3. **URL del deployment fallido**

¡Te ayudaré a resolverlo! 💪
