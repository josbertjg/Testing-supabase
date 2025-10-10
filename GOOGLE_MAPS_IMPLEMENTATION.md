# Implementación de Google Maps Places Autocomplete

## Descripción

Se ha implementado un componente de autocomplete de Google Maps Places en el módulo de "Búsqueda de Doctores". Este componente permite buscar y seleccionar ubicaciones, direcciones, ciudades y estados utilizando la API de Google Maps.

## 🚀 Optimización de Rendimiento

La implementación utiliza un **Context Provider** (`GoogleMapsContext`) con un **Singleton Pattern** para cargar el script de Google Maps **una sola vez** a nivel de aplicación, incluso cuando React StrictMode causa doble renderizado. Esto previene:

- ❌ Cargas duplicadas del script al navegar entre rutas
- ❌ Múltiples llamadas innecesarias a la API de Google Maps
- ❌ Problemas de rendimiento por re-renderizados
- ❌ **Duplicación por React StrictMode** (problema resuelto)
- ✅ **Resultado**: Carga única, rápida y eficiente del autocomplete

## 🔧 Solución al Problema de React StrictMode

**Problema identificado:**
React StrictMode (activado en `src/main.tsx`) causa que los componentes se rendericen dos veces en desarrollo para detectar efectos secundarios. Esto provocaba:

- Dos instancias del `useJsApiLoader`
- Dos selectores de autocomplete visibles
- Script de Google Maps cargado múltiples veces

**Solución implementada:**

1. **Singleton Pattern** (`googleMapsSingleton.ts`): Garantiza que el script se carga solo una vez
2. **Context Provider mejorado**: Usa el singleton en lugar de `useJsApiLoader`
3. **Autocomplete nativo**: Usa `new google.maps.places.Autocomplete()` directamente con cleanup apropiado
4. **Posición del Provider**: Movido fuera del Router para evitar re-montajes

## Archivos Modificados/Creados

### 1. `src/lib/googleMapsSingleton.ts` (Nuevo)

Singleton que maneja la carga de Google Maps una sola vez, incluso con React StrictMode.

**Características:**

- Garantiza que el script se carga solo una vez
- Maneja el estado de carga con Promise
- Previene duplicaciones por React StrictMode
- Proporciona funciones `ensureGoogleMapsLoaded()` e `isGoogleMapsReady()`

### 2. `src/contexts/GoogleMapsContext.tsx` (Nuevo)

Context Provider que usa el singleton para cargar Google Maps una sola vez a nivel de aplicación.

**Características:**

- Usa el singleton para evitar cargas duplicadas
- Comparte el estado de carga entre todos los componentes
- Proporciona `isLoaded` y `loadError` a través del hook `useGoogleMaps()`

**Ventajas:**

- ✅ **Rendimiento optimizado**: El script se carga solo una vez
- ✅ **Sin cargas duplicadas**: Previene múltiples llamadas a la API
- ✅ **Estado compartido**: Todos los componentes saben cuándo está listo
- ✅ **Gestión centralizada**: Fácil de mantener y debuggear
- ✅ **React StrictMode compatible**: No se duplica por doble renderizado

### 3. `src/components/doctors/GooglePlacesAutocomplete.tsx` (Nuevo)

Componente principal que maneja el autocomplete de Google Maps Places.

**Características:**

- Utiliza el hook `useGoogleMaps()` del contexto
- Muestra estados de carga y error
- Configurado para Venezuela (código de país: "ve")
- Restricciones de búsqueda: `geocode` y `establishment`
- Idioma: Español

**Datos que devuelve al seleccionar una ubicación:**

```typescript
{
  nombre: string
  direccion_formateada: string
  geometria: {
    location: {
      lat: number
      lng: number
    }
  }
  place_id: string
  tipos: string[]
  componentes_direccion: AddressComponent[]
}
```

### 4. `src/App.tsx` (Modificado)

Se agregó el `GoogleMapsProvider` envolviendo toda la aplicación para cargar Google Maps una sola vez.

**Cambios:**

- Importación de `GoogleMapsProvider`
- Envuelve las rutas con el provider
- Carga única del script de Google Maps

### 5. `src/components/doctors/DoctorSearch.tsx` (Modificado)

Se agregó el componente `GooglePlacesAutocomplete` por encima del autocomplete de patologías.

**Cambios:**

- Importación del componente `GooglePlacesAutocomplete`
- Función `handlePlaceSelect` que recibe los datos de la ubicación seleccionada
- Muestra los datos en consola cuando se selecciona una ubicación

### 6. `.env` (Configuración)

Archivo de configuración para variables de entorno.

**Variable requerida:**

```env
VITE_GOOGLE_MAPS_API_KEY=tu-clave-api-aqui
```

**Nota:** Este archivo ya debe existir en tu proyecto y está protegido por `.gitignore`.

### 7. `package.json` (Modificado)

Se agregó la dependencia:

```json
"@react-google-maps/api": "^2.20.7"
```

## Configuración

### Paso 1: Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea o selecciona un proyecto
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Crea credenciales (API Key)
5. (Opcional pero recomendado) Restringe la API Key:
   - Restricciones de aplicación: Sitios web
   - Agrega tu dominio
   - Restricciones de API: Selecciona solo Maps JavaScript API y Places API

### Paso 2: Configurar Variables de Entorno

1. Abre o crea el archivo `.env` en la raíz del proyecto
2. Agrega tu API Key:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**Nota:** El archivo `.env` está en `.gitignore` y no se subirá al repositorio.

### Paso 3: Instalar Dependencias

```bash
pnpm install
```

## Uso

El componente ya está integrado en `DoctorSearch`. Al escribir en el campo de búsqueda de ubicación:

1. Google Maps mostrará sugerencias de lugares
2. Al seleccionar una ubicación, se mostrarán en consola:
   - Nombre del lugar
   - Dirección formateada
   - Coordenadas (latitud y longitud)
   - Place ID
   - Tipos de lugar
   - Componentes de dirección (calle, ciudad, código postal, etc.)

## Personalización

### Cambiar el país de búsqueda

En `GooglePlacesAutocomplete.tsx`, línea 94:

```typescript
componentRestrictions: { country: "ve" }, // Venezuela
```

**Actualmente configurado para Venezuela ("ve")**

Otros códigos de país: CO (Colombia), US (Estados Unidos), MX (México), AR (Argentina), ES (España), etc.

### Cambiar tipos de búsqueda

En `GooglePlacesAutocomplete.tsx`, línea 103:

```typescript
types: ["geocode", "establishment"], // Puedes agregar más tipos
```

Tipos disponibles: `geocode`, `address`, `establishment`, `(regions)`, `(cities)`, etc.

### Agregar más campos de datos

En `GooglePlacesAutocomplete.tsx`, línea 101-108:

```typescript
fields: [
  "address_components",
  "formatted_address",
  "geometry",
  "name",
  "place_id",
  "types",
  // Agregar más campos según necesidad
],
```

Campos disponibles: `photos`, `opening_hours`, `rating`, `reviews`, etc.

## Siguiente Paso Sugerido

Para integrar completamente la funcionalidad de búsqueda por ubicación:

1. Almacenar la ubicación seleccionada en el estado de `DoctorSearch`
2. Modificar la función `searchDoctorsByPathology` para incluir filtros de ubicación
3. Actualizar la Edge Function para filtrar doctores por proximidad geográfica
4. Agregar un mapa para visualizar la ubicación de los doctores

## Costos

Google Maps Platform ofrece $200 USD de crédito mensual gratuito.

**Places Autocomplete:**

- $2.83 USD por cada 1,000 solicitudes (después del crédito gratuito)
- Primeras ~70,000 solicitudes/mes gratis con el crédito

**Recomendación:** Implementar límites de uso o autenticación para evitar costos excesivos en producción.

## Documentación Oficial

- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places/web-service)
