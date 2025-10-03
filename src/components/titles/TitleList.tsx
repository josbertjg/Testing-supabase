import React, { useState, useEffect } from "react";
import { supabase, DoctorTitle, Doctor } from "../../lib/supabase";
import { Plus, Edit, Trash2 } from "lucide-react";

const TitleList: React.FC = () => {
  const [titles, setTitles] = useState<(DoctorTitle & { doctor: Doctor })[]>(
    []
  );
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    doctor_id: "",
    title_specialty: "",
    issued_at: "",
    license_number: "",
    graduated_from: "",
    certificate_url: "",
  });

  useEffect(() => {
    fetchTitles();
    fetchDoctors();
  }, []);

  const fetchTitles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doctor_titles")
        .select(
          `
          *,
          doctor:doctors(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTitles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar títulos");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar médicos");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("doctor_titles").insert([
        {
          ...formData,
          issued_at:
            formData.issued_at || new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      setFormData({
        doctor_id: "",
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

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este título?")) return;

    try {
      const { error } = await supabase
        .from("doctor_titles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchTitles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar título");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Títulos Médicos
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de títulos y certificaciones de médicos.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancelar" : "Nuevo Título"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6"
        >
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="doctor_id"
                className="block text-sm font-medium text-gray-700"
              >
                Médico
              </label>
              <div className="mt-1">
                <select
                  name="doctor_id"
                  id="doctor_id"
                  required
                  value={formData.doctor_id}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar médico</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Título/Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Fecha de Emisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Licencia
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {titles.map((title) => (
                    <tr key={title.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {title.doctor?.first_name} {title.doctor?.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {title.title_specialty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(title.issued_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {title.license_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(title.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {titles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    No hay títulos registrados
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleList;
