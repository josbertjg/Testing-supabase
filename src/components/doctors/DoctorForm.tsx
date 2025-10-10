import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import DoctorLocations from "./DoctorLocations";

const DoctorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password_hash: "",
    identity_document: "",
    specialty: "",
    experience_description: "",
    profile_photo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchDoctor = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          password_hash: "",
          identity_document: data.identity_document || "",
          specialty: data.specialty || "",
          experience_description: data.experience_description || "",
          profile_photo_url: data.profile_photo_url || "",
        });
        // Si hay una foto de perfil, establecer la vista previa
        if (data.profile_photo_url) {
          setPhotoPreview(data.profile_photo_url);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar médico");
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      fetchDoctor();
    }
  }, [isEditing, fetchDoctor]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      setPhotoFile(file);

      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, profile_photo_url: "" }));
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return formData.profile_photo_url || null;

    try {
      setUploadingPhoto(true);

      // Generar nombre único para el archivo
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("doctor-profiles")
        .upload(filePath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from("doctor-profiles")
        .getPublicUrl(uploadData.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Error al subir foto:", err);
      throw err;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Subir foto si hay una nueva
      let photoUrl = formData.profile_photo_url || null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const doctorData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        identity_document: formData.identity_document || null,
        specialty: formData.specialty || null,
        experience_description: formData.experience_description || null,
        profile_photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      };

      // Solo incluir password_hash si se está creando un nuevo médico y se proporcionó una contraseña
      if (!isEditing && formData.password_hash) {
        Object.assign(doctorData, { password_hash: formData.password_hash });
      }

      let result;
      if (isEditing) {
        result = await supabase.from("doctors").update(doctorData).eq("id", id);
      } else {
        result = await supabase.from("doctors").insert([doctorData]);
      }

      if (result.error) throw result.error;

      navigate("/doctors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar médico");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/doctors"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Médicos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          {isEditing ? "Editar Médico" : "Nuevo Médico"}
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Apellido
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="identity_document"
                className="block text-sm font-medium text-gray-700"
              >
                Documento de Identidad
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="identity_document"
                  id="identity_document"
                  value={formData.identity_document}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="specialty"
                className="block text-sm font-medium text-gray-700"
              >
                Especialidad
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="specialty"
                  id="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="experience_description"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción de Experiencia
              </label>
              <div className="mt-1">
                <textarea
                  name="experience_description"
                  id="experience_description"
                  rows={3}
                  value={formData.experience_description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Campo de Foto de Perfil */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de Perfil
              </label>

              {/* Vista previa de la foto */}
              {photoPreview && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Vista previa"
                    className="h-32 w-32 rounded-full object-cover border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Botón para subir foto */}
              {!photoPreview && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="photo-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Sube una foto</span>
                        <input
                          id="photo-upload"
                          name="photo-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhotoChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hasta 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="sm:col-span-6">
                <label
                  htmlFor="password_hash"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña (Opcional)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password_hash"
                    id="password_hash"
                    value={formData.password_hash}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/doctors")}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading || uploadingPhoto ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {uploadingPhoto
              ? "Subiendo foto..."
              : loading
              ? "Guardando..."
              : isEditing
              ? "Actualizar"
              : "Guardar"}
          </button>
        </div>
      </form>

      {/* Sección de Ubicaciones - Solo visible al editar */}
      {isEditing && (
        <div className="mt-8">
          <DoctorLocations />
        </div>
      )}
    </div>
  );
};

export default DoctorForm;
