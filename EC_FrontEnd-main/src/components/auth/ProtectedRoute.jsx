
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the route requires specific roles, check user role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    // Redirect to home page or access denied page
    return <Navigate to="/folders" replace />;
  }

  return children;
};

export default ProtectedRoute;
