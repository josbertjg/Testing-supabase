# 🔐 Guía de Autenticación con Google OAuth

## 📋 ¿Qué se implementó?

Se ha agregado inicio de sesión con Google OAuth en las pantallas de **Login** y **Registro**. Esto permite a los usuarios:

- ✅ Iniciar sesión con su cuenta de Google
- ✅ Registrarse automáticamente si no tienen cuenta
- ✅ Acceder al dashboard inmediatamente después de autenticarse
- ✅ Mantener la sesión activa con JWT y refresh tokens

## 🎯 Flujo de Autenticación con Google

### 1. Usuario hace clic en "Continuar con Google"

```typescript
// En GoogleButton.tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/`,
    queryParams: {
      access_type: "offline", // Para obtener refresh token
      prompt: "consent", // Para solicitar consentimiento cada vez
    },
  },
});
```

### 2. Redirección a Google

Supabase redirige automáticamente al usuario a la pantalla de consentimiento de Google:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=https://YOUR_PROJECT.supabase.co/auth/v1/callback
  &response_type=code
  &scope=openid email profile
  &access_type=offline
  &prompt=consent
```

### 3. Usuario autoriza la aplicación

El usuario:

- Ve qué permisos solicita la app (email, perfil básico)
- Acepta o rechaza el acceso
- Es redirigido de vuelta a tu app

### 4. Supabase procesa el callback

```
Google → Supabase Auth Server
        ↓
Supabase valida el código de autorización
        ↓
Obtiene tokens de Google (access_token, refresh_token)
        ↓
Crea o actualiza el usuario en auth.users
        ↓
Genera JWT y refresh token de Supabase
        ↓
Redirige a tu app con el token en la URL
```

### 5. Tu app detecta la sesión

```typescript
// En AuthContext.tsx
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

### 6. ProtectedRoute permite acceso al dashboard

```typescript
// En ProtectedRoute.tsx
if (!user) {
  return <Navigate to="/login" replace />;
}

return <>{children}</>;
```

## 🔑 ¿Cómo se manejan los datos del usuario?

### Registro Automático

Cuando un usuario se autentica con Google por primera vez:

```sql
-- Supabase automáticamente crea un registro en auth.users
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  provider,
  created_at
) VALUES (
  'uuid-generado',
  'usuario@gmail.com',
  '{
    "name": "Juan Pérez",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "email": "usuario@gmail.com",
    "email_verified": true,
    "full_name": "Juan Pérez",
    "iss": "https://accounts.google.com",
    "picture": "https://lh3.googleusercontent.com/...",
    "provider_id": "1234567890",
    "sub": "1234567890"
  }',
  'google',
  NOW()
);
```

### Acceso a los datos del usuario

```typescript
// En cualquier componente
const { user } = useAuth();

// Datos disponibles:
user?.id; // UUID único de Supabase
user?.email; // Email de Google
user?.user_metadata?.name; // Nombre completo
user?.user_metadata?.avatar_url; // Foto de perfil
user?.user_metadata?.email_verified; // true (siempre para Google)
user?.user_metadata?.provider_id; // ID de Google
```

## 📊 Estructura de datos en auth.users

Cuando un usuario se autentica con Google, Supabase almacena:

```typescript
{
  id: "uuid",
  email: "usuario@gmail.com",
  provider: "google",
  raw_user_meta_data: {
    name: "Juan Pérez",
    avatar_url: "https://...",
    email: "usuario@gmail.com",
    email_verified: true,
    full_name: "Juan Pérez",
    iss: "https://accounts.google.com",
    picture: "https://...",
    provider_id: "1234567890",
    sub: "1234567890"
  },
  app_metadata: {
    provider: "google",
    providers: ["google"]
  },
  created_at: "2024-01-01T00:00:00Z",
  last_sign_in_at: "2024-01-01T00:00:00Z"
}
```

## 🔧 Configuración en Supabase Dashboard

### 1. Habilitar el proveedor de Google

1. Ve a **Authentication** > **Providers** en tu Supabase Dashboard
2. Busca **Google** en la lista de proveedores
3. Activa el toggle **Enable Sign in with Google**

### 2. Configurar credenciales de Google

Ya tienes esto configurado, pero para referencia:

1. **Client ID**: Tu ID de cliente de OAuth 2.0 de Google
2. **Client Secret**: Tu secreto de cliente de Google
3. **Redirect URL**: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Esta URL debe estar configurada en Google Cloud Console

### 3. Configurar URLs permitidas (Opcional pero recomendado)

En **Authentication** > **URL Configuration**:

- **Site URL**: `http://localhost:5173` (desarrollo) o tu dominio de producción
- **Redirect URLs**: Agrega las URLs desde donde permitirás el login

## 🔄 Diferencias: Login Normal vs OAuth con Google

### Login con Email/Password

```typescript
// Proceso manual
1. Usuario ingresa email y contraseña
2. Supabase verifica credenciales
3. Genera JWT
4. Usuario debe confirmar email (opcional)

// Datos almacenados
- email
- encrypted_password
- user_metadata: { name: "nombre ingresado" }
```

### Login con Google OAuth

```typescript
// Proceso automático
1. Usuario hace clic en "Continuar con Google"
2. Google verifica identidad
3. Supabase recibe confirmación
4. Genera JWT automáticamente

// Datos almacenados
- email (verificado por Google)
- NO hay password (auth sin contraseña)
- user_metadata: {
    name: "del perfil de Google",
    avatar_url: "foto de Google",
    email_verified: true
  }
```

## 🎨 Componentes Implementados

### GoogleButton.tsx

```typescript
interface GoogleButtonProps {
  mode: "login" | "register";
}

// Muestra el botón apropiado según el contexto
// - "Continuar con Google" en Login
// - "Registrarse con Google" en Register
```

### Estilos del botón

El botón incluye:

- 🎨 Logo oficial de Google (4 colores)
- ⚡ Estado de carga con spinner
- 🔒 Deshabilitado durante redirección
- ♿ Accesible y responsive

## 🚀 Flujo Completo de Ejemplo

```
Usuario en /login
    ↓
Clic en "Continuar con Google"
    ↓
Supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Redirección a Google (https://accounts.google.com/...)
    ↓
Usuario selecciona cuenta de Google
    ↓
Usuario acepta permisos
    ↓
Google redirige a: https://YOUR_PROJECT.supabase.co/auth/v1/callback?code=xxx
    ↓
Supabase Auth Server:
  - Valida código
  - Obtiene tokens de Google
  - Crea/actualiza usuario en auth.users
  - Genera JWT de Supabase
    ↓
Supabase redirige a: http://localhost:5173/#access_token=xxx&refresh_token=yyy
    ↓
AuthContext detecta nueva sesión:
  - onAuthStateChange se dispara
  - setUser(session.user)
  - setSession(session)
    ↓
ProtectedRoute ve user !== null
    ↓
Permite acceso al dashboard
    ↓
Usuario ve sus datos en Layout:
  - Nombre de Google
  - Email de Google
  - Botón de cerrar sesión
```

## 🔐 Seguridad y Tokens

### Access Token (JWT)

```typescript
// Generado por Supabase
{
  "sub": "user-uuid",
  "email": "usuario@gmail.com",
  "user_metadata": {
    "name": "Juan Pérez",
    "avatar_url": "https://...",
    "provider_id": "1234567890"
  },
  "role": "authenticated",
  "aal": "aal1",
  "exp": 1234567890, // 1 hora
  "iss": "https://YOUR_PROJECT.supabase.co/auth/v1"
}
```

### Refresh Token

```typescript
// String único, almacenado en:
// - localStorage (navegador)
// - auth.refresh_tokens (base de datos)

// Válido por ~7 días
// Se renueva automáticamente cada vez que se usa
```

### Provider Token (Google)

```typescript
// Opcional: Token de acceso de Google
// Almacenado en session.provider_token
// Útil si necesitas acceder a APIs de Google

// Para obtenerlo, agregar en queryParams:
{
  access_type: 'offline',
  prompt: 'consent'
}
```

## ❓ Preguntas Frecuentes

### ¿El usuario necesita contraseña?

**NO**. Cuando un usuario se registra/loguea con Google, NO tiene contraseña en Supabase. La autenticación es manejada completamente por Google.

### ¿Puede un usuario usar email Y Google?

**SÍ**, pero se crean dos registros diferentes si:

- Se registra con email: `usuario@gmail.com` + password
- Luego intenta con Google: `usuario@gmail.com` (sin password)

Supabase los trata como usuarios separados. Para vincularlos, necesitarías lógica adicional.

### ¿Se puede desactivar la confirmación de email?

Con Google OAuth, la confirmación de email NO es necesaria porque Google ya verificó la identidad del usuario.

### ¿Funciona en producción?

Sí, pero debes:

1. Actualizar la **Redirect URL** en Google Cloud Console
2. Agregar tu dominio a las **Redirect URLs** en Supabase
3. Actualizar `redirectTo` en el código para apuntar a tu dominio

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "https://tu-dominio.com/", // ← Cambiar aquí
  },
});
```

### ¿Cómo obtengo la foto de perfil del usuario?

```typescript
const { user } = useAuth();
const avatarUrl = user?.user_metadata?.avatar_url;

// Usar en un componente de imagen:
<img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />;
```

## 🎯 Próximos Pasos Recomendados

1. **Agregar foto de perfil en el Layout**

   ```typescript
   {
     user?.user_metadata?.avatar_url && (
       <img
         src={user.user_metadata.avatar_url}
         alt="Avatar"
         className="w-8 h-8 rounded-full"
       />
     );
   }
   ```

2. **Implementar otros proveedores OAuth**

   - GitHub
   - Microsoft
   - Facebook
   - Apple

3. **Vincular cuentas existentes**

   - Permitir que un usuario vincule Google a una cuenta existente

4. **Personalizar el flujo de registro**
   - Solicitar información adicional después del OAuth
   - Crear un perfil completo en una tabla separada

## 🛠️ Solución de Problemas

### El botón no redirige

- Verifica que `supabaseUrl` y `supabaseAnonKey` sean correctos
- Revisa la consola del navegador para errores
- Confirma que Google OAuth esté habilitado en Supabase

### Error: "Invalid redirect URL"

- Verifica que la URL esté en la lista de Redirect URLs en Supabase
- En desarrollo: `http://localhost:5173`
- Asegúrate de incluir el protocolo (`http://` o `https://`)

### El usuario no se crea automáticamente

- Revisa los logs en Supabase Dashboard > Authentication > Logs
- Verifica que el email de prueba de Google sea válido
- Confirma que no haya políticas RLS bloqueando la inserción

### La sesión no persiste después de recargar

- Verifica que `persistSession: true` esté configurado en `supabase.ts`
- Revisa que localStorage no esté bloqueado
- Confirma que `autoRefreshToken: true` esté habilitado

## ✅ Checklist de Implementación

- [x] Componente GoogleButton creado
- [x] Botón agregado a Login
- [x] Botón agregado a Register
- [x] OAuth configurado en Supabase
- [x] Redirección automática al dashboard
- [x] Creación automática de usuarios
- [x] Manejo de sesiones con JWT
- [x] Nombre de usuario mostrado en Layout
- [ ] (Opcional) Mostrar foto de perfil
- [ ] (Opcional) Agregar otros proveedores OAuth
