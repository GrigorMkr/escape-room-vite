import {Navigate, useLocation} from 'react-router-dom';

type PrivateRouteProps = {
  isAuthorized: boolean;
  children: JSX.Element;
};

const PrivateRoute = ({isAuthorized, children}: PrivateRouteProps) => {
  const location = useLocation();

  if (!isAuthorized) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  return children;
};

export default PrivateRoute;
