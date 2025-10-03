import React, { useState, useEffect } from "react";
import {
  supabase,
  type Doctor,
  type Procedure,
  type DoctorProcedure,
} from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";

const DoctorProcedures: React.FC = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [doctorProcedures, setDoctorProcedures] = useState<
    (DoctorProcedure & { procedure: Procedure })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    procedure_id: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchDoctor();
      fetchProcedures();
      fetchDoctorProcedures();
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

  const fetchProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setProcedures(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar procedimientos"
      );
    }
  };

  const fetchDoctorProcedures = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doctor_procedures")
        .select(
          `
          *,
          procedure:procedures(*)
        `
        )
        .eq("doctor_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoctorProcedures(data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar procedimientos del médico"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const { error } = await supabase.from("doctor_procedures").insert([
        {
          doctor_id: id,
          procedure_id: formData.procedure_id,
          notes: formData.notes || null,
        },
      ]);

      if (error) throw error;

      setFormData({ procedure_id: "", notes: "" });
      setShowForm(false);
      fetchDoctorProcedures();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al asignar procedimiento"
      );
    }
  };

  const handleDelete = async (procedureId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este procedimiento del médico?"
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("doctor_procedures")
        .delete()
        .eq("id", procedureId);

      if (error) throw error;
      fetchDoctorProcedures();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar procedimiento"
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
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
      <div className="mb-6">
        <Link
          to="/doctors"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Médicos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Procedimientos de {doctor?.first_name} {doctor?.last_name}
        </h1>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancelar" : "Asignar Procedimiento"}
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
                htmlFor="procedure_id"
                className="block text-sm font-medium text-gray-700"
              >
                Procedimiento
              </label>
              <div className="mt-1">
                <select
                  name="procedure_id"
                  id="procedure_id"
                  required
                  value={formData.procedure_id}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar procedimiento</option>
                  {procedures.map((procedure) => (
                    <option key={procedure.id} value={procedure.id}>
                      {procedure.name} {procedure.code && `(${procedure.code})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notas (Opcional)
              </label>
              <div className="mt-1">
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Notas adicionales sobre este procedimiento..."
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
              Asignar Procedimiento
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {doctorProcedures.map((item) => (
            <li key={item.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.procedure.name}
                    </h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {item.procedure.code && (
                      <p>
                        <strong>Código:</strong> {item.procedure.code}
                      </p>
                    )}
                    {item.procedure.description && (
                      <p>
                        <strong>Descripción:</strong>{" "}
                        {item.procedure.description}
                      </p>
                    )}
                    {item.notes && (
                      <p>
                        <strong>Notas:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {doctorProcedures.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              No hay procedimientos asignados a este médico
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProcedures;
