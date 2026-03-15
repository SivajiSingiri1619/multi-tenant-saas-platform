import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h2>Dashboard</h2>

      <p>Welcome, <b>{user.fullName}</b></p>
      <p>Role: <b>{user.role}</b></p>

      {user.tenant && (
        <>
          <p>Tenant: <b>{user.tenant.name}</b></p>
          <p>Plan: <b>{user.tenant.subscriptionPlan}</b></p>
        </>
      )}
    </Layout>
  );
}
