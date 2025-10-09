# 🔐 Flujo Detallado de JWT y Sesiones en Supabase

## 📊 Diagrama de Flujo Completo

```
REGISTRO
┌─────────────────────────────────────────────────────────────┐
│ Usuario → Formulario (nombre, email, password)              │
│                           ↓                                  │
│ supabase.auth.signUp({                                       │
│   email: "juan@example.com",                                │
│   password: "123456",                                        │
│   options: { data: { name: "Juan Pérez" } }                 │
│ })                                                           │
│                           ↓                                  │
│ Supabase crea:                                              │
│ ┌─────────────────────────────────────────────────┐         │
│ │ auth.users                                      │         │
│ │ ├─ id: uuid                                     │         │
│ │ ├─ email: "juan@example.com"                    │         │
│ │ ├─ encrypted_password: "hash..."                │         │
│ │ └─ raw_user_meta_data: { name: "Juan Pérez" }   │         │
│ └─────────────────────────────────────────────────┘         │
│                           ↓                                  │
│ Retorna { user, session } o pide confirmación email         │
└─────────────────────────────────────────────────────────────┘

INICIO DE SESIÓN
┌─────────────────────────────────────────────────────────────┐
│ Usuario → email + password                                   │
│                           ↓                                  │
│ supabase.auth.signInWithPassword({ email, password })       │
│                           ↓                                  │
│ Supabase genera JWT:                                        │
│ ┌─────────────────────────────────────────────────┐         │
│ │ ACCESS TOKEN (JWT)                              │         │
│ │ ┌─────────────────────────────────────────┐     │         │
│ │ │ Header:                                 │     │         │
│ │ │   { "alg": "HS256", "typ": "JWT" }     │     │         │
│ │ │                                         │     │         │
│ │ │ Payload:                                │     │         │
│ │ │   {                                     │     │         │
│ │ │     "sub": "user-uuid",                 │     │         │
│ │ │     "email": "juan@example.com",        │     │         │
│ │ │     "user_metadata": {                  │     │         │
│ │ │       "name": "Juan Pérez"              │     │         │
│ │ │     },                                  │     │         │
│ │ │     "role": "authenticated",            │     │         │
│ │ │     "aal": "aal1",                      │     │         │
│ │ │     "session_id": "session-uuid",       │     │         │
│ │ │     "exp": 1234567890,  // ← 1 hora     │     │         │
│ │ │     "iat": 1234564290                   │     │         │
│ │ │   }                                     │     │         │
│ │ │                                         │     │         │
│ │ │ Signature: HMACSHA256(...)              │     │         │
│ │ └─────────────────────────────────────────┘     │         │
│ │                                                 │         │
│ │ REFRESH TOKEN                                   │         │
│ │   "v1.MKpXvc..." (string único, ~7 días)        │         │
│ │                                                 │         │
│ │ METADATA                                        │         │
│ │   expires_at: 1234567890                        │         │
│ │   expires_in: 3600 (segundos)                   │         │
│ └─────────────────────────────────────────────────┘         │
│                           ↓                                  │
│ Se guarda en localStorage:                                  │
│   "sb-{project-ref}-auth-token"                             │
└─────────────────────────────────────────────────────────────┘

PERSISTENCIA Y AUTO-REFRESH
┌─────────────────────────────────────────────────────────────┐
│ Cliente Supabase monitorea constantemente:                   │
│                                                              │
│ Cada 30 segundos:                                           │
│   const now = Date.now() / 1000                             │
│   const expiresAt = session.expires_at                      │
│   const timeLeft = expiresAt - now                          │
│                                                              │
│   if (timeLeft < 60) {  // Menos de 1 minuto               │
│     // ← RENOVAR TOKEN                                      │
│     const { data } = await supabase.auth.refreshSession()  │
│                                                              │
│     // Supabase internamente hace:                          │
│     POST /auth/v1/token?grant_type=refresh_token           │
│     Body: { refresh_token: "v1.MKpXvc..." }                │
│                                                              │
│     // Respuesta:                                           │
│     {                                                        │
│       access_token: "nuevo-jwt...",                         │
│       refresh_token: "nuevo-refresh...",                    │
│       expires_at: (ahora + 3600)                            │
│     }                                                        │
│                                                              │
│     // Emite evento: TOKEN_REFRESHED                        │
│     onAuthStateChange('TOKEN_REFRESHED', newSession)       │
│   }                                                          │
└─────────────────────────────────────────────────────────────┘

DETECCIÓN DE EXPIRACIÓN
┌─────────────────────────────────────────────────────────────┐
│ Escenario 1: Refresh Token Expiró (~7 días sin uso)         │
│ ┌─────────────────────────────────────────────────┐         │
│ │ Auto-refresh intenta renovar                    │         │
│ │          ↓                                      │         │
│ │ Supabase responde: 401 Unauthorized             │         │
│ │          ↓                                      │         │
│ │ Cliente Supabase:                               │         │
│ │   - Limpia localStorage                         │         │
│ │   - Emite: onAuthStateChange('SIGNED_OUT')      │         │
│ │          ↓                                      │         │
│ │ AuthContext detecta:                            │         │
│ │   setSession(null)                              │         │
│ │   setUser(null)                                 │         │
│ │          ↓                                      │         │
│ │ ProtectedRoute ve user = null                   │         │
│ │          ↓                                      │         │
│ │ <Navigate to="/login" />                        │         │
│ └─────────────────────────────────────────────────┘         │
│                                                              │
│ Escenario 2: Usuario Cierra Sesión Manualmente             │
│ ┌─────────────────────────────────────────────────┐         │
│ │ onClick → signOut()                             │         │
│ │          ↓                                      │         │
│ │ supabase.auth.signOut()                         │         │
│ │          ↓                                      │         │
│ │ Supabase:                                       │         │
│ │   - Invalida refresh_token en BD                │         │
│ │   - Limpia localStorage                         │         │
│ │   - Emite: SIGNED_OUT                           │         │
│ │          ↓                                      │         │
│ │ Mismo flujo que Escenario 1                     │         │
│ └─────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘

USO DEL JWT EN PETICIONES
┌─────────────────────────────────────────────────────────────┐
│ Cada petición a Supabase incluye el JWT:                    │
│                                                              │
│ const { data } = await supabase                             │
│   .from('patients')                                          │
│   .select('*')                                              │
│                                                              │
│ ↓ Internamente se convierte en:                             │
│                                                              │
│ GET /rest/v1/patients                                       │
│ Headers: {                                                  │
│   'Authorization': 'Bearer eyJhbGc...',  // ← JWT           │
│   'apikey': 'anon-key'                                      │
│ }                                                           │
│                                                              │
│ ↓ Supabase verifica:                                        │
│                                                              │
│ 1. JWT válido y no expirado?                                │
│ 2. Firma correcta?                                          │
│ 3. Role permitido?                                          │
│ 4. RLS policies permiten acceso?                            │
│                                                              │
│ ✓ Si todo OK → Retorna datos                               │
│ ✗ Si expiró → 401 + "JWT expired"                          │
│                                                              │
│ El cliente detecta 401 → Intenta refresh → Si falla SIGN_OUT│
└─────────────────────────────────────────────────────────────┘
```

## 🕐 Línea de Tiempo de una Sesión

```
T = 0s
├─ Usuario inicia sesión
├─ Recibe JWT (expira en 3600s)
├─ Recibe Refresh Token (expira en ~604800s = 7 días)
└─ Tokens guardados en localStorage

T = 30s, 60s, 90s...
└─ Cliente verifica expiry cada 30s (no hace nada, aún tiene tiempo)

T = 3540s (59 minutos)
├─ Cliente detecta: quedan < 60 segundos
├─ Usa refresh_token para pedir nuevo JWT
├─ Supabase valida refresh_token
├─ Genera nuevo JWT (expira en T + 3600 = 7140s)
├─ Genera nuevo refresh_token
├─ Cliente actualiza localStorage
└─ Emite evento: TOKEN_REFRESHED

T = 7140s (1h 59min)
└─ Se repite el proceso...

T = 604800s (7 días) [Usuario inactivo]
├─ Intento de refresh
├─ Refresh token expiró
├─ Supabase retorna 401
├─ Cliente limpia sesión
├─ Emite: SIGNED_OUT
└─ Redirect a /login
```

## 📍 Dónde Está Cada Cosa

### En Supabase Dashboard (Base de Datos)

```sql
-- Tabla: auth.users
SELECT
  id,                              -- UUID del usuario
  email,                           -- Email
  encrypted_password,              -- Password hasheado
  raw_user_meta_data,             -- { "name": "Juan Pérez" } ← AQUÍ EL NOMBRE
  created_at,
  last_sign_in_at
FROM auth.users;

-- Tabla: auth.sessions (solo si usas server-side auth)
SELECT
  id,                              -- UUID de la sesión
  user_id,                         -- Referencia al usuario
  created_at,
  updated_at,
  factor_id,                       -- Para MFA
  aal                              -- Authentication Assurance Level
FROM auth.sessions;

-- Tabla: auth.refresh_tokens
SELECT
  token,                           -- El refresh token hasheado
  user_id,                         -- Referencia al usuario
  revoked,                         -- Si fue revocado
  created_at,
  updated_at
FROM auth.refresh_tokens;
```

### En localStorage del Navegador

```javascript
// Key: sb-fynzhfrffhegquakmsiz-auth-token
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "refresh_token": "v1.MKpXvc2RhdGEiOnt...",
  "user": {
    "id": "uuid",
    "email": "juan@example.com",
    "user_metadata": {
      "name": "Juan Pérez"  // ← AQUÍ TAMBIÉN
    },
    "aud": "authenticated",
    "role": "authenticated"
  }
}
```

### En el AuthContext de React

```typescript
const [user, setUser] = useState<User | null>(null);
const [session, setSession] = useState<Session | null>(null);

// user contiene:
user = {
  id: "uuid",
  email: "juan@example.com",
  user_metadata: {
    name: "Juan Pérez", // ← Y AQUÍ
  },
};

// session contiene:
session = {
  access_token: "eyJ...",
  refresh_token: "v1.MKp...",
  expires_at: 1234567890,
  user: {
    /* mismo que arriba */
  },
};
```

## ❓ Preguntas Frecuentes

### ¿Necesito configuración extra en Supabase para guardar el nombre?

**NO.** El `user_metadata` es un campo JSON estándar en `auth.users`. Puedes guardar cualquier dato ahí:

```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name: "Juan",
      apellido: "Pérez",
      edad: 30,
      ciudad: "Madrid",
      // ... cualquier cosa
    },
  },
});
```

### ¿El nombre viaja en el JWT?

**SÍ.** El `user_metadata` se incluye en el payload del JWT, por lo que:

- ✅ No necesitas hacer queries extra para obtenerlo
- ❌ No guardes datos sensibles ahí (son visibles en el JWT)
- ✅ Perfecto para: nombre, avatar, preferencias UI, etc.

### ¿Cuándo exactamente expira la sesión?

```
Access Token: 1 hora (configurable en Dashboard)
Refresh Token: 7 días de inactividad (configurable)

Si el usuario usa la app cada día → Nunca expira
Si está 7 días sin usar → Debe re-autenticarse
```

### ¿Cómo saber si estoy autenticado en tiempo real?

```typescript
// En cualquier componente:
const { user, session, loading } = useAuth();

if (loading) return <Spinner />;
if (!user) return <Login />;
return <Dashboard />;
```

El hook `useAuth()` SIEMPRE tiene el estado actualizado porque escucha `onAuthStateChange`.

## 🔒 Mejores Prácticas Implementadas

✅ **Auto-refresh antes de expirar** - No hay interrupción para el usuario
✅ **Persistencia en localStorage** - Sesión sobrevive recargas de página  
✅ **Limpieza automática** - Tokens expirados se limpian solos
✅ **Detección de expiración** - Múltiples niveles de detección
✅ **User metadata seguro** - Datos no sensibles en JWT para acceso rápido
✅ **Redirección automática** - Sin sesión → Login, con sesión → Dashboard

## 🚀 Para Probarlo

1. Regístrate con nombre, email, password
2. Abre DevTools → Application → Local Storage
3. Busca la key `sb-fynzhfrffhegquakmsiz-auth-token`
4. Verás tu access_token (cópialo)
5. Pégalo en [jwt.io](https://jwt.io)
6. Verás tu nombre en el payload! 🎉
