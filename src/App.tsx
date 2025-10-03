import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import PatientList from "./components/patients/PatientList";
import PatientForm from "./components/patients/PatientForm";
import DoctorList from "./components/doctors/DoctorList";
import DoctorForm from "./components/doctors/DoctorForm";
import DoctorTitles from "./components/doctors/DoctorTitles";
import DoctorPathologies from "./components/doctors/DoctorPathologies";
import DoctorProcedures from "./components/doctors/DoctorProcedures";
import PathologyList from "./components/pathologies/PathologyList";
import ProcedureList from "./components/procedures/ProcedureList";
import TitleList from "./components/titles/TitleList";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/patients" replace />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/new" element={<PatientForm />} />
          <Route path="patients/:id/edit" element={<PatientForm />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="doctors/new" element={<DoctorForm />} />
          <Route path="doctors/:id/edit" element={<DoctorForm />} />
          <Route path="doctors/:id/titles" element={<DoctorTitles />} />
          <Route
            path="doctors/:id/pathologies"
            element={<DoctorPathologies />}
          />
          <Route path="doctors/:id/procedures" element={<DoctorProcedures />} />
          <Route path="titles" element={<TitleList />} />
          <Route path="pathologies" element={<PathologyList />} />
          <Route path="procedures" element={<ProcedureList />} />
          <Route
            path="reports"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Reportes
                </h2>
                <p className="mt-2 text-gray-600">
                  Funcionalidad de reportes en desarrollo
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
