import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    tenantSubdomain: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/dashboard"); 
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
        style={{
        maxWidth: "480px",
        margin: "50px auto",
        padding: "25px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        }}
    >
    <form onSubmit={submit}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <input
        placeholder="Tenant Subdomain (skip for super admin)"
        value={form.tenantSubdomain}
        onChange={(e) =>
          setForm({ ...form, tenantSubdomain: e.target.value })
        }
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
    <p style={{ textAlign: "center", marginTop: "15px" }}>
      New organization? <Link to="/register">Register here</Link>
    </p>

  </div>
    
  );
}
