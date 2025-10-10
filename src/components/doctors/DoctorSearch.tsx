import { useState, useEffect, useRef } from "react";
import {
  Search,
  UserCheck,
  Mail,
  Briefcase,
  Stethoscope,
  ChevronDown,
  X,
  User,
} from "lucide-react";
import { supabase, supabaseUrl } from "../../lib/supabase";
import type { Pathology, Doctor } from "../../lib/supabase";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";

export default function DoctorSearch() {
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [selectedPathology, setSelectedPathology] = useState<Pathology | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar todas las patologías al montar el componente
  useEffect(() => {
    fetchPathologies();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar patologías según el input
  const filteredPathologies = pathologies.filter((pathology) => {
    const searchTerm = inputValue.toLowerCase();
    return (
      pathology.name.toLowerCase().includes(searchTerm) ||
      (pathology.code && pathology.code.toLowerCase().includes(searchTerm))
    );
  });

  // Scroll automático al elemento resaltado
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const fetchPathologies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pathologies")
        .select("*")
        .order("name");

      if (error) throw error;
      setPathologies(data || []);
    } catch (err: unknown) {
      console.error("Error al cargar patologías:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const searchDoctorsByPathology = async (pathologyId: string) => {
    if (!pathologyId) {
      setDoctors([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      console.log("🔍 Buscando doctores para patología:", pathologyId);

      // Llamar a la Edge Function con query params
      const url = `doctors-by-pathology?pathology_id=${encodeURIComponent(
        pathologyId
      )}`;

      const response = await fetch(`${supabaseUrl}/functions/v1/${url}`, {
        headers: {
          Authorization: `Bearer ${
            (
              await supabase.auth.getSession()
            ).data.session?.access_token
          }`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Doctores encontrados:", data);
      setDoctors(data || []);
    } catch (err: unknown) {
      console.error("Error al buscar doctores:", err);
      setError(err instanceof Error ? err.message : "Error al buscar doctores");
      setDoctors([]);
    } finally {
      setSearching(false);
    }
  };

  const searchDoctorsByCity = async (city: string) => {
    if (!city) {
      setDoctors([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      console.log("🔍 Buscando doctores en la ciudad:", city);

      // Buscar ubicaciones de doctores en la ciudad seleccionada
      const { data: locations, error: locError } = await supabase
        .from("doctor_locations")
        .select("doctor_id")
        .ilike("city", city);

      if (locError) throw locError;

      if (!locations || locations.length === 0) {
        console.log("❌ No se encontraron ubicaciones en esta ciudad");
        setDoctors([]);
        return;
      }

      // Obtener IDs únicos de doctores
      const doctorIds = [...new Set(locations.map((loc) => loc.doctor_id))];
      console.log("📍 IDs de doctores encontrados:", doctorIds);

      // Buscar información de los doctores
      const { data: doctorsData, error: docError } = await supabase
        .from("doctors")
        .select("*")
        .in("id", doctorIds);

      if (docError) throw docError;

      console.log("✅ Doctores encontrados en la ciudad:", doctorsData);
      setDoctors(doctorsData || []);
    } catch (err: unknown) {
      console.error("Error al buscar doctores por ciudad:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al buscar doctores por ciudad"
      );
      setDoctors([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
    setHighlightedIndex(0);

    // Si el input está vacío, limpiar la selección
    if (!value) {
      setSelectedPathology(null);
      setDoctors([]);
    }
  };

  const handleSelectPathology = (pathology: Pathology) => {
    setSelectedPathology(pathology);
    setInputValue(pathology.name);
    setIsOpen(false);
    searchDoctorsByPathology(pathology.id);
  };

  const handleClearSelection = () => {
    setSelectedPathology(null);
    setInputValue("");
    setDoctors([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredPathologies.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredPathologies[highlightedIndex]) {
          handleSelectPathology(filteredPathologies[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place) {
      console.log("📍 Lugar seleccionado en DoctorSearch:", place);

      // Extraer la ciudad de los componentes de dirección
      const addressComponents = place.address_components;
      let city = null;

      if (addressComponents) {
        // Buscar el componente que sea "locality" (ciudad)
        const cityComponent = addressComponents.find((component) =>
          component.types.includes("locality")
        );

        if (cityComponent) {
          city = cityComponent.long_name;
        } else {
          // Si no hay "locality", intentar con "administrative_area_level_2"
          const adminComponent = addressComponents.find((component) =>
            component.types.includes("administrative_area_level_2")
          );
          if (adminComponent) {
            city = adminComponent.long_name;
          }
        }
      }

      console.log("🏙️ Ciudad extraída:", city);

      if (city) {
        setSelectedCity(city);
        searchDoctorsByCity(city);
      } else {
        setError(
          "No se pudo determinar la ciudad de la ubicación seleccionada"
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Búsqueda de Doctores
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Busca doctores especializados según la patología
          </p>
        </div>
        <Search className="h-8 w-8 text-indigo-600" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete onPlaceSelect={handlePlaceSelect} />

      {/* Indicador de ciudad seleccionada */}
      {selectedCity && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            🏙️ Buscando doctores en:{" "}
            <span className="font-semibold">{selectedCity}</span>
          </p>
        </div>
      )}

      {/* Autocomplete de Patologías */}
      <div className="bg-white shadow rounded-lg p-6">
        <label
          htmlFor="pathology"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Busca una Patología
        </label>
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              id="pathology"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              disabled={loading}
              placeholder="Escribe para buscar..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="off"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {selectedPathology ? (
              <button
                onClick={handleClearSelection}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Dropdown */}
          {isOpen && !loading && filteredPathologies.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            >
              {filteredPathologies.map((pathology, index) => (
                <div
                  key={pathology.id}
                  onClick={() => handleSelectPathology(pathology)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                    index === highlightedIndex
                      ? "bg-indigo-600 text-white"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {pathology.code && (
                        <span className="mr-2 text-xs opacity-75">
                          {pathology.code}
                        </span>
                      )}
                      {pathology.name}
                    </span>
                    {pathology.description && (
                      <span className="text-xs opacity-75 truncate">
                        {pathology.description}
                      </span>
                    )}
                  </div>
                  {selectedPathology?.id === pathology.id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {isOpen &&
            !loading &&
            inputValue &&
            filteredPathologies.length === 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-base ring-1 ring-black ring-opacity-5 sm:text-sm"
              >
                <p className="text-gray-500 text-center">
                  No se encontraron patologías
                </p>
              </div>
            )}
        </div>
        {loading && (
          <p className="mt-2 text-sm text-gray-500">Cargando patologías...</p>
        )}
        {selectedPathology && (
          <p className="mt-2 text-sm text-green-600">
            ✓ Patología seleccionada: {selectedPathology.name}
          </p>
        )}
      </div>

      {/* Loading State */}
      {searching && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Buscando doctores...</p>
        </div>
      )}

      {/* Results */}
      {!searching &&
        (selectedPathology !== null || selectedCity !== null) &&
        doctors.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron doctores
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedPathology &&
                !selectedCity &&
                "No hay doctores especializados en esta patología."}
              {selectedCity &&
                !selectedPathology &&
                `No hay doctores en ${selectedCity}.`}
              {selectedPathology &&
                selectedCity &&
                `No hay doctores en ${selectedCity} especializados en esta patología.`}
            </p>
          </div>
        )}

      {/* Doctors List */}
      {!searching && doctors.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Doctores Encontrados ({doctors.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <li
                key={doctor.id}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50"
              >
                <div className="flex items-start space-x-4">
                  {/* Foto de perfil */}
                  <div className="flex-shrink-0">
                    {doctor.profile_photo_url ? (
                      <img
                        src={doctor.profile_photo_url}
                        alt={`${doctor.first_name} ${doctor.last_name}`}
                        className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Información del doctor */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-indigo-600 mr-2" />
                      <p className="text-sm font-medium text-indigo-600">
                        Dr(a). {doctor.first_name} {doctor.last_name}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:space-x-6">
                      {doctor.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1" />
                          {doctor.email}
                        </div>
                      )}
                      {doctor.specialty && (
                        <div className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {doctor.specialty}
                        </div>
                      )}
                    </div>
                    {doctor.experience_description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {doctor.experience_description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Initial State */}
      {!searching && selectedPathology === null && selectedCity === null && (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Busca doctores por ubicación o patología
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona una ubicación o elige una patología para ver los doctores
            disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
