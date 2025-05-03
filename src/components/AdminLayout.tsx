// src/components/AdminLayout.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const AdminLayout = () => {
  const { currentUser, userData } = useUser();

  if (!currentUser || userData?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Outlet />
    </div>
  );
};

export default AdminLayout;