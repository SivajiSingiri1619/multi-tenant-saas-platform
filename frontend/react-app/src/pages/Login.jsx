import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = email === "superadmin@system.com";

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const payload = { email, password };

    // 🔥 ONLY tenant admin / user
    if (email !== "superadmin@system.com") {
      payload.tenantSubdomain = subdomain;
    }

    console.log("LOGIN PAYLOAD:", payload);

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("LOGIN FAILED:", text);
      setError("Invalid credentials");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.data.token);
    window.location.href = "/dashboard";

  } catch (err) {
    console.error(err);
    setError("Backend not reachable");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="auth-card" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          placeholder="Tenant Subdomain"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          disabled={isSuperAdmin}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {isSuperAdmin && (
        <p style={{ fontSize: "12px", color: "#aaa" }}>
          Super admin login detected
        </p>
      )}
      <p style={{ marginTop: "10px", fontSize: "14px" }}>
  New tenant? <a href="/register">Register here</a>
</p>

    </div>
  );
}
