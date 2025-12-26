import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Tenants from "./pages/Tenants";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";


export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/tenants" element={
          <ProtectedRoute>
            <Tenants />
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
