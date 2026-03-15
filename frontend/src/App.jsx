import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Users from "./pages/Users";
import Register from "./pages/Register";
import Tenants from "./pages/Tenants";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
 
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["tenant_admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenants"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <Tenants />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
