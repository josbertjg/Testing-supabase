# Guía de Autenticación - Sistema Médico

## 📋 Descripción General

Se ha implementado un sistema completo de autenticación utilizando Supabase Auth con JWT tokens y refresh tokens. El sistema incluye:

- ✅ Registro de usuarios con nombre, email y contraseña
- ✅ Inicio de sesión con email y contraseña
- ✅ Gestión automática de sesiones con JWT
- ✅ Refresh tokens automáticos
- ✅ Protección de rutas
- ✅ Cierre de sesión
- ✅ Manejo de sesiones expiradas

## 🔐 Características de Seguridad

### JWT Tokens

- **Access Token**: Token de corta duración (1 hora por defecto) que se usa para autenticar las peticiones
- **Refresh Token**: Token de larga duración que se usa para obtener nuevos access tokens sin que el usuario tenga que iniciar sesión nuevamente

### Gestión Automática de Sesión

El cliente de Supabase está configurado para:

- **persistSession: true** - Guarda la sesión en localStorage
- **autoRefreshToken: true** - Renueva automáticamente el access token antes de que expire
- **detectSessionInUrl: true** - Detecta tokens en la URL (útil para confirmación de email)

### Protección de Rutas

Todas las rutas del dashboard están protegidas y solo son accesibles para usuarios autenticados.

## 📁 Estructura de Archivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticación global
├── components/
│   ├── auth/
│   │   ├── Login.tsx            # Componente de inicio de sesión
│   │   ├── Register.tsx         # Componente de registro
│   │   └── ProtectedRoute.tsx   # HOC para proteger rutas
│   └── Layout.tsx               # Layout con botón de cerrar sesión
├── lib/
│   └── supabase.ts              # Cliente de Supabase configurado
└── App.tsx                      # Rutas de la aplicación
```

## 🚀 Flujo de Autenticación

### 1. Registro de Usuario

```typescript
// El usuario se registra con:
- Nombre completo
- Email
- Contraseña (mínimo 6 caracteres)

// Supabase automáticamente:
- Hashea la contraseña
- Crea el usuario en auth.users
- Puede enviar email de confirmación (si está configurado)
```

### 2. Inicio de Sesión

```typescript
// El usuario inicia sesión con:
- Email
- Contraseña

// Supabase retorna:
- Access Token (JWT)
- Refresh Token
- Información del usuario
```

### 3. Mantenimiento de Sesión

```typescript
// El sistema automáticamente:
- Guarda tokens en localStorage
- Renueva el access token antes de que expire
- Mantiene la sesión activa entre recargas de página
```

### 4. Cierre de Sesión

```typescript
// Al cerrar sesión:
- Se invalidan los tokens
- Se limpia localStorage
- Se redirige al login
```

## 🔄 Manejo de Estados

### AuthContext

El contexto de autenticación proporciona:

```typescript
interface AuthContextType {
  user: User | null; // Usuario actual
  session: Session | null; // Sesión actual
  loading: boolean; // Estado de carga
  signUp: (email, password, name) => Promise<{ error }>;
  signIn: (email, password) => Promise<{ error }>;
  signOut: () => Promise<void>;
}
```

### Estados de la Aplicación

1. **Loading**: Mientras se verifica la sesión inicial
2. **Authenticated**: Usuario autenticado, acceso al dashboard
3. **Unauthenticated**: Usuario no autenticado, redirigir a login

## 🛡️ Seguridad Implementada

### 1. Validación de Contraseñas

- Mínimo 6 caracteres
- Confirmación de contraseña en registro

### 2. Manejo de Errores

- Mensajes de error claros para el usuario
- No expone información sensible

### 3. Tokens Seguros

- Access tokens de corta duración
- Refresh tokens almacenados de forma segura
- Renovación automática de tokens

### 4. Protección de Rutas

- Verificación de autenticación en cada ruta protegida
- Redirección automática a login si no está autenticado
- Pantalla de carga mientras se verifica la sesión

## 📝 Uso en Componentes

### Acceder a la información del usuario

```typescript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, session } = useAuth();

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>ID: {user?.id}</p>
    </div>
  );
}
```

### Proteger una ruta

```typescript
<Route
  path="/protected"
  element={
    <ProtectedRoute>
      <MyProtectedComponent />
    </ProtectedRoute>
  }
/>
```

### Cerrar sesión

```typescript
import { useAuth } from "../contexts/AuthContext";

function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Automáticamente redirige a /login
  };

  return <button onClick={handleLogout}>Cerrar Sesión</button>;
}
```

## 🔧 Configuración de Supabase

### Verificación de Email (Opcional)

Por defecto, Supabase puede requerir verificación de email. Para desarrollo:

1. Ve a Authentication > Settings en Supabase Dashboard
2. Desactiva "Enable email confirmations" para desarrollo
3. En producción, configura un servidor SMTP para enviar emails

### Configuración de URLs de Redirección

En Supabase Dashboard > Authentication > URL Configuration:

- Agrega tus URLs permitidas para redirección
- Ejemplo: `http://localhost:5173`, `https://tudominio.com`

## 🎯 Eventos de Autenticación

El sistema escucha los siguientes eventos:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Eventos posibles:
  // - INITIAL_SESSION: Sesión inicial cargada
  // - SIGNED_IN: Usuario inició sesión
  // - SIGNED_OUT: Usuario cerró sesión
  // - TOKEN_REFRESHED: Token renovado automáticamente
  // - USER_UPDATED: Información del usuario actualizada
});
```

## 🐛 Solución de Problemas

### La sesión no persiste entre recargas

- Verifica que `persistSession: true` esté configurado
- Revisa que localStorage no esté bloqueado en el navegador

### Tokens expiran muy rápido

- Verifica la configuración de JWT expiry en Supabase Dashboard
- Asegúrate que `autoRefreshToken: true` esté habilitado

### Errores de CORS

- Verifica las URLs permitidas en Supabase Dashboard
- Asegúrate de usar la URL correcta del proyecto

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://supabase.com/docs/guides/auth/sessions)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## ✅ Checklist de Implementación

- [x] Contexto de autenticación creado
- [x] Componentes de Login y Register
- [x] Protección de rutas implementada
- [x] Gestión automática de tokens
- [x] Manejo de sesiones expiradas
- [x] Botón de cerrar sesión
- [x] Validación de formularios
- [x] Manejo de errores
- [x] Estados de carga
- [x] **OAuth con Google implementado**
- [x] **Registro automático con Google**
- [x] **Redirección automática al dashboard**

## 🌐 Autenticación con Google OAuth

### ¿Cómo funciona?

1. Usuario hace clic en **"Continuar con Google"**
2. Es redirigido a la pantalla de consentimiento de Google
3. Autoriza el acceso a su email y perfil
4. Google redirige de vuelta a tu app
5. Supabase crea/actualiza el usuario automáticamente
6. Usuario es redirigido al dashboard

### Datos que se obtienen de Google

- ✅ Email (verificado)
- ✅ Nombre completo
- ✅ Foto de perfil
- ✅ ID de usuario de Google

### Configuración necesaria

1. **En Google Cloud Console**:

   - Client ID y Client Secret (ya configurados)
   - Redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

2. **En Supabase Dashboard**:

   - Habilitar Google en Authentication > Providers
   - Agregar credenciales de Google
   - Configurar Redirect URLs permitidas

3. **En tu código**:
   ```typescript
   // Ya implementado en GoogleButton.tsx
   await supabase.auth.signInWithOAuth({
     provider: "google",
     options: {
       redirectTo: `${window.location.origin}/`,
     },
   });
   ```

### Ventajas del OAuth con Google

- 🚀 **Sin contraseña**: No necesitas gestionar contraseñas
- ✅ **Email verificado**: Google ya verificó el email
- 🔐 **Más seguro**: Usa los sistemas de seguridad de Google
- ⚡ **Más rápido**: Registro en un solo clic
- 📸 **Foto de perfil**: Obtienes la foto automáticamente

### Documentación completa

Para más detalles, consulta [GOOGLE_OAUTH_GUIDE.md](./GOOGLE_OAUTH_GUIDE.md)

## 🔮 Próximos Pasos (Opcional)

1. **Recuperación de Contraseña**: Implementar flujo de "olvidé mi contraseña"
2. **Más proveedores OAuth**: GitHub, Microsoft, Facebook, Apple
3. **Autenticación de dos factores (2FA)**
4. **Roles y permisos**: Diferenciar entre pacientes, doctores y administradores
5. **Row Level Security (RLS)**: Políticas de seguridad a nivel de base de datos
6. **Vincular cuentas**: Permitir vincular Google a cuenta existente
