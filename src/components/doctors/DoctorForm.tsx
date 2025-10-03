import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      fetchDoctor();
    }
  }, [id, isEditing]);

  const fetchDoctor = async () => {
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
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar médico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const doctorData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        identity_document: formData.identity_document || null,
        specialty: formData.specialty || null,
        experience_description: formData.experience_description || null,
        updated_at: new Date().toISOString(),
      };

      // Solo incluir password_hash si se está creando un nuevo médico y se proporcionó una contraseña
      if (!isEditing && formData.password_hash) {
        (doctorData as any).password_hash = formData.password_hash;
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
            disabled={loading}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
