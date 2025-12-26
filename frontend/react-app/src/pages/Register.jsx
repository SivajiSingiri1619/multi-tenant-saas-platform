import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: form.tenantName,
          subdomain: form.subdomain,
          adminEmail: form.adminEmail,
          adminPassword: form.password,
          adminFullName: form.adminFullName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Tenant registered successfully. Please login.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Register Tenant</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input name="tenantName" placeholder="Organization Name" onChange={handleChange} required />
        <input name="subdomain" placeholder="Subdomain (example: demo)" onChange={handleChange} required />
        <input name="adminFullName" placeholder="Admin Full Name" onChange={handleChange} required />
        <input name="adminEmail" type="email" placeholder="Admin Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />

        <button disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;
