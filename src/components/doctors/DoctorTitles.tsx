import React, { useState, useEffect } from "react";
import { supabase, DoctorTitle, Doctor } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import { Plus, ArrowLeft, Edit, Trash2 } from "lucide-react";

const DoctorTitles: React.FC = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [titles, setTitles] = useState<DoctorTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title_specialty: "",
    issued_at: "",
    license_number: "",
    graduated_from: "",
    certificate_url: "",
  });

  useEffect(() => {
    if (id) {
      fetchDoctor();
      fetchTitles();
    }
  }, [id]);

  const fetchDoctor = async () => {
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
  };

  const fetchTitles = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doctor_titles")
        .select("*")
        .eq("doctor_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTitles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar títulos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const { error } = await supabase.from("doctor_titles").insert([
        {
          doctor_id: id,
          ...formData,
          issued_at:
            formData.issued_at || new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      setFormData({
        title_specialty: "",
        issued_at: "",
        license_number: "",
        graduated_from: "",
        certificate_url: "",
      });
      setShowForm(false);
      fetchTitles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar título");
    }
  };

  const handleDelete = async (titleId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este título?")) return;

    try {
      const { error } = await supabase
        .from("doctor_titles")
        .delete()
        .eq("id", titleId);

      if (error) throw error;
      fetchTitles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar título");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

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
          Títulos de {doctor?.first_name} {doctor?.last_name}
        </h1>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancelar" : "Agregar Título"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6"
        >
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="title_specialty"
                className="block text-sm font-medium text-gray-700"
              >
                Título/Especialidad
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title_specialty"
                  id="title_specialty"
                  required
                  value={formData.title_specialty}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="issued_at"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha de Emisión
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="issued_at"
                  id="issued_at"
                  value={formData.issued_at}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="license_number"
                className="block text-sm font-medium text-gray-700"
              >
                Número de Licencia
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="license_number"
                  id="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="graduated_from"
                className="block text-sm font-medium text-gray-700"
              >
                Universidad/Institución
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="graduated_from"
                  id="graduated_from"
                  value={formData.graduated_from}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="certificate_url"
                className="block text-sm font-medium text-gray-700"
              >
                URL del Certificado (Opcional)
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="certificate_url"
                  id="certificate_url"
                  value={formData.certificate_url}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Título
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {titles.map((title) => (
            <li key={title.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {title.title_specialty}
                    </h3>
                    <button
                      onClick={() => handleDelete(title.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(title.issued_at).toLocaleDateString("es-ES")}
                    </p>
                    {title.license_number && (
                      <p>
                        <strong>Licencia:</strong> {title.license_number}
                      </p>
                    )}
                    {title.graduated_from && (
                      <p>
                        <strong>Universidad:</strong> {title.graduated_from}
                      </p>
                    )}
                    {title.certificate_url && (
                      <p>
                        <strong>Certificado:</strong>{" "}
                        <a
                          href={title.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver certificado
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {titles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              No hay títulos registrados para este médico
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTitles;
