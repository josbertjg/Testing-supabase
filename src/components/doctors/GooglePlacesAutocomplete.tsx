import { useState, useRef } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { MapPin, Loader2 } from "lucide-react";

const libraries: "places"[] = ["places"];

interface GooglePlacesAutocompleteProps {
  onPlaceSelect?: (place: google.maps.places.PlaceResult | null) => void;
}

export default function GooglePlacesAutocomplete({
  onPlaceSelect,
}: GooglePlacesAutocompleteProps) {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "es",
  });

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    console.log("🗺️ Autocomplete cargado:", autocompleteInstance);
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      console.log("📍 Lugar seleccionado:", place);
      console.log("📍 Datos completos del lugar:", {
        nombre: place.name,
        direccion_formateada: place.formatted_address,
        geometria: place.geometry,
        coordenadas: {
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        },
        place_id: place.place_id,
        tipos: place.types,
        componentes_direccion: place.address_components,
      });

      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    } else {
      console.log("❌ Autocomplete es null");
    }
  };

  if (loadError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar Google Maps
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {loadError.message}. Por favor, verifica que tu API Key esté
                correctamente configurada en el archivo .env
                (VITE_GOOGLE_MAPS_API_KEY)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm text-gray-600">Cargando Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <label
        htmlFor="location"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Busca una Ubicación
      </label>
      <div className="relative">
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "ve" }, // Venezuela
            fields: [
              "address_components",
              "formatted_address",
              "geometry",
              "name",
              "place_id",
              "types",
            ],
            types: ["geocode", "establishment"],
          }}
        >
          <input
            ref={inputRef}
            id="location"
            type="text"
            placeholder="Escribe una dirección, ciudad o estado..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            autoComplete="off"
          />
        </Autocomplete>
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Ingresa una dirección, ciudad o estado para buscar
      </p>
    </div>
  );
}
