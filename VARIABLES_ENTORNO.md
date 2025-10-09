# 🔐 Guía de Variables de Entorno

## 📋 ¿Qué se Cambió?

Se movieron todas las **claves sensibles** de los archivos de código a variables de entorno para mejorar la seguridad.

### ✅ Beneficios

- 🔒 **Seguridad**: Las claves no están hardcodeadas en el código
- 🚫 **No se suben a Git**: `.env` está en `.gitignore`
- 🔄 **Fácil de cambiar**: Cambia entornos sin tocar el código
- 👥 **Colaboración**: Cada desarrollador usa sus propias claves

---

## 📁 Archivos Creados

### `.env` (NO se sube a Git)

Contiene tus claves reales:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://fynzhfrffhegquakmsiz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### `.env.example` (SÍ se sube a Git)

Template para otros desarrolladores:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🔧 Cómo Funcionan las Variables de Entorno en Vite

### Prefijo `VITE_`

Vite requiere que las variables de entorno tengan el prefijo `VITE_` para exponerlas al cliente:

```env
✅ VITE_SUPABASE_URL         - Accesible en el cliente
✅ VITE_SUPABASE_ANON_KEY    - Accesible en el cliente
❌ SUPABASE_URL              - NO accesible (sin prefijo VITE_)
```

### Acceso en el Código

```typescript
// En cualquier archivo .ts/.tsx
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## 📝 Cambios en el Código

### Antes (❌ Inseguro)

```typescript
// src/lib/supabase.ts
const supabaseUrl = "https://fynzhfrffhegquakmsiz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Después (✅ Seguro)

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan variables de entorno");
}
```

---

## 🚀 Cómo Usar en Desarrollo

### 1. Verifica que `.env` existe

```bash
# En la raíz del proyecto
ls .env
```

Si no existe, créalo desde `.env.example`:

```bash
cp .env.example .env
```

### 2. Configura tus claves en `.env`

Abre `.env` y reemplaza con tus valores reales:

```env
VITE_SUPABASE_URL=https://TU_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUÍ
```

### 3. Reinicia el servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C)
# Vuelve a iniciarlo
npm run dev
```

⚠️ **IMPORTANTE**: Vite solo lee `.env` al **iniciar** el servidor. Si cambias `.env`, debes reiniciar.

---

## 🌍 Entornos Diferentes

Puedes tener diferentes archivos para cada entorno:

```
.env                  ← Desarrollo local (Git ignored)
.env.local            ← Desarrollo local (Git ignored)
.env.production       ← Producción
.env.example          ← Template (Git tracked)
```

### Ejemplo:

**`.env.local`** (desarrollo)

```env
VITE_SUPABASE_URL=https://fynzhfrffhegquakmsiz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**`.env.production`** (producción)

```env
VITE_SUPABASE_URL=https://produccion.supabase.co
VITE_SUPABASE_ANON_KEY=otro_key...
```

---

## 🛡️ Seguridad

### ✅ Lo que SÍ está protegido

```env
.env               ← En .gitignore, NO se sube a Git
.env.local         ← En .gitignore, NO se sube a Git
.env.production    ← En .gitignore, NO se sube a Git
```

### ⚠️ Lo que SÍ se sube a Git

```env
.env.example       ← Template SIN claves reales
```

### ❌ NUNCA pongas en .env

```env
# ❌ NO pongas claves privadas de servidor
SUPABASE_SERVICE_ROLE_KEY=xxx  # Esto es PELIGROSO en el cliente

# ✅ SÍ puedes poner claves públicas
VITE_SUPABASE_ANON_KEY=xxx     # Esta es pública, está OK
```

---

## 🔍 Verificar Variables de Entorno

### En tiempo de desarrollo

```typescript
// Agrega console.log temporal
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
});
```

### En el navegador

```javascript
// Abre DevTools (F12) > Console
console.log(import.meta.env);

// Verás:
{
  VITE_SUPABASE_URL: "https://...",
  VITE_SUPABASE_ANON_KEY: "eyJhbGc...",
  MODE: "development",
  DEV: true,
  PROD: false,
  SSR: false
}
```

---

## ⚙️ TypeScript IntelliSense

Para tener autocompletado de las variables de entorno, crea:

**`src/vite-env.d.ts`** (opcional)

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 🚨 Errores Comunes

### Error: "Faltan variables de entorno"

**Causa**: El archivo `.env` no existe o está vacío

**Solución**:

```bash
# 1. Verifica que .env existe
ls .env

# 2. Si no existe, créalo desde .env.example
cp .env.example .env

# 3. Edita .env con tus claves reales

# 4. Reinicia el servidor
npm run dev
```

### Error: Variables undefined en el código

**Causa**: No reiniciaste el servidor después de crear `.env`

**Solución**:

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### Error: Variables vacías

**Causa**: Olvidaste el prefijo `VITE_`

**Solución**:

```env
# ❌ Mal
SUPABASE_URL=...

# ✅ Bien
VITE_SUPABASE_URL=...
```

---

## 📚 Recursos

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs#get-the-api-keys)

---

## ✅ Checklist

- [x] Archivo `.env` creado
- [x] Archivo `.env.example` creado
- [x] `.env` agregado a `.gitignore`
- [x] `src/lib/supabase.ts` actualizado
- [x] Validación de variables agregada
- [x] Errores de TypeScript corregidos

---

## 🎉 ¡Listo!

Tus claves ahora están **protegidas** y **no se subirán a Git**.

Para que otros desarrolladores usen tu proyecto:

1. Clonan el repo
2. Copian `.env.example` a `.env`
3. Agregan sus propias claves
4. ¡Listo para trabajar!
