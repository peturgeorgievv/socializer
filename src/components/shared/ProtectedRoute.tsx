import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component, isAuthenticated, ...rest }: any) => {
  console.log(isAuthenticated);
  const routeComponent = (props: any) =>
    isAuthenticated && isAuthenticated.currentUser ? (
      React.createElement(component, props)
    ) : (
      <Redirect to={{ pathname: "/signin" }} />
    );
  return <Route {...rest} render={routeComponent} />;
};

export default ProtectedRoute;
