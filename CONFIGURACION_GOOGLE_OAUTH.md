# ⚙️ Configuración Rápida - Google OAuth

## 🎯 Lo que se implementó

✅ Botón "Continuar con Google" en **Login**  
✅ Botón "Registrarse con Google" en **Register**  
✅ Registro automático de usuarios nuevos  
✅ Login automático para usuarios existentes  
✅ Redirección automática al dashboard  
✅ Sincronización de datos de perfil (nombre, email, foto)

---

## 🚀 Cómo Probar (Desarrollo)

### 1. Asegúrate de que Google OAuth esté habilitado en Supabase

```bash
# Verifica en Supabase Dashboard:
# Authentication > Providers > Google > Estado: ACTIVO ✅
```

### 2. Ejecuta la aplicación

```bash
npm run dev
```

### 3. Prueba el flujo

1. **Ve a http://localhost:5173/login**
2. **Haz clic en "Continuar con Google"**
3. **Selecciona tu cuenta de Google**
4. **Autoriza el acceso**
5. **Serás redirigido al dashboard automáticamente** 🎉

---

## 📸 Cómo se ve

### Pantalla de Login

```
┌─────────────────────────────────────────┐
│          Sistema Médico                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Email                              │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Contraseña                         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Iniciar Sesión                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ─────────── O continúa con ────────────│
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  [G]  Continuar con Google         │ │ ← NUEVO
│  └────────────────────────────────────┘ │
│                                          │
│  ¿No tienes cuenta? Regístrate aquí     │
└─────────────────────────────────────────┘
```

### Pantalla de Registro

```
┌─────────────────────────────────────────┐
│          Crear Cuenta                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Nombre completo                    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Email                              │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Contraseña                         │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Confirmar contraseña               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Crear Cuenta                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ─────────── O regístrate con ──────────│
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  [G]  Registrarse con Google       │ │ ← NUEVO
│  └────────────────────────────────────┘ │
│                                          │
│  ¿Ya tienes cuenta? Inicia sesión aquí  │
└─────────────────────────────────────────┘
```

---

## 🔄 Flujo Visual del Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUJO DE AUTENTICACIÓN                      │
└─────────────────────────────────────────────────────────────┘

  👤 Usuario en /login o /register
         │
         ↓
  🖱️  Clic en "Continuar/Registrarse con Google"
         │
         ↓
  🌐 Redirección a Google
         │
         ↓
  📋 Pantalla de Google: "Selecciona tu cuenta"
         │
         ↓
  ✅ Usuario selecciona cuenta y autoriza
         │
         ↓
  🔄 Google → Supabase Auth Server
         │
         ↓
  🔐 Supabase procesa OAuth:
     ├─ Valida código de autorización
     ├─ Obtiene datos del usuario de Google
     ├─ Crea usuario en auth.users (si es nuevo)
     ├─ O actualiza datos (si existe)
     └─ Genera JWT + Refresh Token
         │
         ↓
  🏠 Redirección automática a http://localhost:5173/
         │
         ↓
  ⚡ AuthContext detecta nueva sesión
         │
         ↓
  🎯 ProtectedRoute permite acceso
         │
         ↓
  🎉 Usuario ve el Dashboard con su nombre y email
```

---

## 🛠️ Configuración en Supabase (Ya hecha)

### En Authentication > Providers > Google

```
✅ Enabled: ON

Client ID (for OAuth):
[tu-client-id].apps.googleusercontent.com

Client Secret (for OAuth):
GOCSPX-[tu-secret]

Authorized Client IDs:
[opcional, para mobile/desktop]

Skip nonce check:
[ ] No marcado (recomendado)
```

---

## 🌍 URLs Configuradas

### Redirect URLs en Supabase

```
Authentication > URL Configuration > Redirect URLs

✅ http://localhost:5173/**
✅ http://localhost:5173
✅ https://tu-dominio.com/** (producción)
```

### Callback URL en Google Cloud Console

```
Authorized redirect URIs:

✅ https://fynzhfrffhegquakmsiz.supabase.co/auth/v1/callback
```

---

## 📊 Datos que Obtiene Automáticamente

Cuando un usuario se autentica con Google, Supabase recibe:

```javascript
{
  // Datos básicos
  id: "uuid-generado-por-supabase",
  email: "usuario@gmail.com",
  provider: "google",

  // Metadata del usuario (de Google)
  user_metadata: {
    name: "Juan Pérez",
    full_name: "Juan Pérez",
    avatar_url: "https://lh3.googleusercontent.com/...",
    picture: "https://lh3.googleusercontent.com/...",
    email: "usuario@gmail.com",
    email_verified: true,
    provider_id: "1234567890",
    sub: "1234567890"
  },

  // Metadata de la aplicación
  app_metadata: {
    provider: "google",
    providers: ["google"]
  }
}
```

### ¿Dónde acceder a estos datos?

```typescript
// En cualquier componente con useAuth()
const { user } = useAuth();

// Email
const email = user?.email; // "usuario@gmail.com"

// Nombre
const name = user?.user_metadata?.name; // "Juan Pérez"

// Foto de perfil
const avatar = user?.user_metadata?.avatar_url;
// "https://lh3.googleusercontent.com/..."

// Email verificado?
const verified = user?.user_metadata?.email_verified; // true
```

---

## 🔐 Seguridad

### ¿Es seguro?

✅ **SÍ**, porque:

1. **OAuth 2.0**: Protocolo estándar de la industria
2. **HTTPS**: Toda la comunicación está encriptada
3. **Tokens de corta duración**: JWT expira en 1 hora
4. **Refresh automático**: Tokens se renuevan sin intervención del usuario
5. **No almacenas contraseñas**: Google las maneja
6. **Email verificado**: Google ya verificó el email

### ¿Qué pasa si roban el token?

- El **access token** expira en 1 hora
- El **refresh token** se revoca al cerrar sesión
- Puedes invalidar todos los tokens desde Supabase Dashboard

---

## ❓ Preguntas Frecuentes

### 1. ¿El usuario necesita crear contraseña?

**NO**. Con Google OAuth, NO hay contraseña. La autenticación la maneja Google.

### 2. ¿Si el usuario ya existe, qué pasa?

Si el **email** ya existe en Supabase:

- Se **actualiza** la información del usuario
- Se mantiene el mismo `user.id`
- Se agrega Google a los providers

### 3. ¿Si el usuario es nuevo, se crea automáticamente?

**SÍ**. Supabase crea el usuario automáticamente con:

- Email de Google
- Nombre de Google
- Foto de perfil de Google
- `email_verified: true`

### 4. ¿Puedo obtener más datos de Google?

Sí, puedes solicitar **scopes adicionales**:

```typescript
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    scopes: "email profile https://www.googleapis.com/auth/calendar",
    //                    ↑ Acceso al calendario de Google
  },
});
```

### 5. ¿Funciona en producción?

Sí, pero debes:

1. **Actualizar Redirect URL en Google Cloud Console**

   ```
   https://tu-dominio.com
   https://fynzhfrffhegquakmsiz.supabase.co/auth/v1/callback
   ```

2. **Actualizar Redirect URLs en Supabase**

   ```
   https://tu-dominio.com/**
   ```

3. **Actualizar el código**
   ```typescript
   redirectTo: "https://tu-dominio.com/",
   ```

---

## 🚨 Solución de Problemas

### Problema: "Invalid redirect URI"

**Solución:**

```bash
1. Ve a Google Cloud Console
2. Credentials > OAuth 2.0 Client IDs > [tu-client-id]
3. Authorized redirect URIs > Agregar:
   https://fynzhfrffhegquakmsiz.supabase.co/auth/v1/callback
4. Guardar
```

### Problema: El botón no hace nada

**Solución:**

```bash
1. Abre DevTools (F12) > Console
2. Verifica errores en rojo
3. Confirma que Google OAuth esté habilitado en Supabase
4. Revisa que las credenciales sean correctas
```

### Problema: Redirige pero no inicia sesión

**Solución:**

```bash
1. Revisa Authentication > Logs en Supabase Dashboard
2. Busca errores en el callback
3. Verifica que la Redirect URL esté permitida
4. Confirma que localStorage no esté bloqueado
```

### Problema: El nombre no se muestra

**Solución:**

```typescript
// Verifica en Layout.tsx:
const { user } = useAuth();
console.log(user?.user_metadata); // ¿Tiene name?

// Si no tiene name, Google podría no haberlo enviado
// Intenta con:
user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.email?.split("@")[0];
```

---

## ✅ Testing Checklist

Prueba estos escenarios:

- [ ] **Usuario nuevo con Google** → Se crea y loguea
- [ ] **Usuario existente con Google** → Se loguea correctamente
- [ ] **Cerrar sesión** → Se cierra correctamente
- [ ] **Recarga de página** → Sesión persiste
- [ ] **Nombre se muestra** → Aparece en el Layout
- [ ] **Email se muestra** → Aparece en el Layout
- [ ] **Redirección** → Va al dashboard después del login
- [ ] **Protección de rutas** → No autenticado no puede acceder

---

## 🎨 Personalización

### Cambiar el texto del botón

```typescript
// En GoogleButton.tsx
const buttonText =
  mode === "login"
    ? "Continuar con Google" // ← Cambiar aquí
    : "Registrarse con Google"; // ← Cambiar aquí
```

### Cambiar el estilo del botón

```typescript
// En GoogleButton.tsx, línea 32
className="w-full flex items-center justify-center gap-3 px-4 py-2
  border border-gray-300 rounded-md shadow-sm bg-white
  text-sm font-medium text-gray-700
  hover:bg-gray-50
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors"

// Modifica las clases según necesites
```

### Agregar más información después del OAuth

```typescript
// Después del OAuth, redirige a un formulario de completar perfil
options: {
  redirectTo: `${window.location.origin}/complete-profile`,
}
```

---

## 📚 Recursos Adicionales

- [Documentación Supabase OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT Tokens explicados](https://jwt.io/introduction)
- [GOOGLE_OAUTH_GUIDE.md](./GOOGLE_OAUTH_GUIDE.md) - Guía completa

---

## 🎉 ¡Listo!

Tu aplicación ahora tiene:

✅ Login con email/password  
✅ Registro con email/password  
✅ **Login con Google OAuth** ← NUEVO  
✅ **Registro con Google OAuth** ← NUEVO  
✅ Protección de rutas  
✅ Manejo automático de sesiones  
✅ JWT + Refresh tokens  
✅ Logout funcional

**¡Los usuarios pueden registrarse e iniciar sesión con Google en un solo clic!** 🚀
