import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function RoleRoute({ role, children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.isLoggedIn || auth.role !== role) {
    // figure out what the auth.role is for debugging
    // console.error(`Access denied: expected role ${role}, but got ${auth.role}`);
    const redirectPath = auth.role === 'admin' ? '/admin' : '/passenger';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
}

export default RoleRoute;