import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const RequireUser = (props) => {
  const { token, user } = useSelector((state) => state.auth);

  if (token && user) {
    return props.children;
  } else {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }
};

export const UserAuth = (props) => {
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);

  if (token && user && isAuthenticated) {
    return <Navigate to={{ pathname: `/`, state: { from: props.location } }} />;
  } else {
    return props.children;
  }
};

export const IsAdminOnly = (props) => {
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);
  if (token && isAuthenticated && user?.is_superuser) {
    return props.children;
  } else {
    return <Navigate to={{ pathname: "/forbidden" }} />;
  }
};
