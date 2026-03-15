import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // -------- Frontend validations --------
    if (!form.organizationName.trim()) {
      return setError("Organization name is required");
    }

    if (!form.subdomain.trim()) {
      return setError("Subdomain is required");
    }

    if (!/^[a-z0-9]+$/.test(form.subdomain)) {
      return setError(
        "Subdomain must contain only lowercase letters and numbers"
      );
    }

    if (!form.adminEmail.trim()) {
      return setError("Email is required");
    }

    if (!/^\S+@\S+\.\S+$/.test(form.adminEmail)) {
      return setError("Enter a valid email address");
    }

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!form.agree) {
      return setError("You must agree to the Terms & Conditions");
    }

    setLoading(true);

    const payload = {
      tenantName: form.organizationName,
      subdomain: form.subdomain,
      adminEmail: form.adminEmail,
      adminFullName: form.adminFullName,
      adminPassword: form.password,
    };

    try {
      await api.post("/auth/register-tenant", payload);

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data);

      // Show backend-specific error if available
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your inputs."
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
      <h2 style={{ textAlign: "center" }}>Register Organization</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={submit}>
        <div style={{ marginBottom: "12px" }}>
          <label>Organization Name</label>
          <input
            style={{ width: "100%" }}
            name="organizationName"
            value={form.organizationName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Subdomain</label>
          <input
            style={{ width: "100%" }}
            name="subdomain"
            value={form.subdomain}
            onChange={handleChange}
            required
          />
          <small style={{ color: "#555" }}>
            Your workspace URL:{" "}
            <b>{form.subdomain || "yourorg"}.yourapp.com</b>
          </small>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Admin Email</label>
          <input
            style={{ width: "100%" }}
            type="email"
            name="adminEmail"
            placeholder="admin@company.com"
            value={form.adminEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Admin Full Name</label>
          <input
            style={{ width: "100%" }}
            name="adminFullName"
            value={form.adminFullName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Password</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              style={{ width: "100%" }}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Confirm Password</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              style={{ width: "100%" }}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? "Hide" : "View"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <span>I agree to Terms & Conditions</span>
          </label>
        </div>

        <button style={{ width: "100%" }} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
