import React, { useState, useEffect, useCallback } from "react";
import { supabase, type DoctorLocation, type Doctor } from "../../lib/supabase";
import { useParams } from "react-router-dom";
import { MapPin, Plus, X, Loader2 } from "lucide-react";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";

const DoctorLocations: React.FC = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [locations, setLocations] = useState<DoctorLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);

  const fetchDoctor = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDoctor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar médico");
    }
  }, [id]);

  const fetchLocations = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doctor_locations")
        .select("*")
        .eq("doctor_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar ubicaciones"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDoctor();
      fetchLocations();
    }
  }, [id, fetchDoctor, fetchLocations]);

  const handleAddLocation = async (
    place: google.maps.places.PlaceResult | null
  ) => {
    if (!place || !place.place_id || !id) return;

    try {
      setAddingLocation(true);
      setValidationError(null);

      const latitude = place.geometry?.location?.lat() || 0;
      const longitude = place.geometry?.location?.lng() || 0;

      // Verificar si ya existe una ubicación con las mismas coordenadas
      const { data: existingLocations, error: checkError } = await supabase
        .from("doctor_locations")
        .select("*")
        .eq("doctor_id", id)
        .eq("latitude", latitude)
        .eq("longitude", longitude);

      if (checkError) throw checkError;

      if (existingLocations && existingLocations.length > 0) {
        setValidationError("Ya registraste esta ubicación");
        setAddingLocation(false);
        return;
      }

      // Extraer ciudad, región y país de los componentes de dirección
      let city = null;
      let region = null;
      let country = null;

      if (place.address_components) {
        place.address_components.forEach((component) => {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            region = component.long_name;
          }
          if (component.types.includes("country")) {
            country = component.long_name;
          }
        });
      }

      const locationData = {
        doctor_id: id,
        place_id: place.place_id,
        formatted_address: place.formatted_address || "",
        latitude: latitude,
        longitude: longitude,
        city: city,
        region: region,
        country: country,
      };

      const { data, error } = await supabase
        .from("doctor_locations")
        .insert([locationData])
        .select()
        .single();

      if (error) throw error;

      // Agregar la nueva ubicación a la lista
      setLocations((prev) => [data, ...prev]);
      setShowAddLocation(false);

      console.log("✅ Ubicación agregada:", data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al agregar ubicación"
      );
    } finally {
      setAddingLocation(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta ubicación?"))
      return;

    try {
      const { error } = await supabase
        .from("doctor_locations")
        .delete()
        .eq("id", locationId);

      if (error) throw error;

      // Remover la ubicación de la lista
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));

      console.log("✅ Ubicación eliminada");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar ubicación"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Cargando ubicaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ubicaciones de {doctor?.first_name} {doctor?.last_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las ubicaciones donde atiende el médico
          </p>
        </div>
        <MapPin className="h-8 w-8 text-indigo-600" />
      </div>

      {/* Agregar ubicación */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Agregar Nueva Ubicación
          </h2>
          {!showAddLocation && (
            <button
              onClick={() => {
                setShowAddLocation(true);
                setValidationError(null);
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir Localidad
            </button>
          )}
        </div>

        {showAddLocation && (
          <div className="space-y-4">
            <GooglePlacesAutocomplete onPlaceSelect={handleAddLocation} />
            {validationError && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-yellow-800">
                    {validationError}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddLocation(false);
                  setValidationError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              {addingLocation && (
                <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de ubicaciones */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Ubicaciones Registradas ({locations.length})
          </h3>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay ubicaciones registradas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega la primera ubicación usando el botón "Añadir Localidad"
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {locations.map((location) => (
              <li
                key={location.id}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                      <p className="text-sm font-medium text-indigo-600">
                        {location.formatted_address}
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {(location.city ||
                        location.region ||
                        location.country) && (
                        <p className="text-xs text-gray-600">
                          {[location.city, location.region, location.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Coordenadas: {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Agregado:{" "}
                        {new Date(location.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(location.id)}
                    className="ml-4 text-red-600 hover:text-red-900"
                    title="Eliminar ubicación"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorLocations;
