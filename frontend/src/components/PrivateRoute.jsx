import React from "react";
import { Navigate } from "react-router-dom";

// Checks if token exists in localStorage.
// If yes - show the page.
// If no  - send to /login.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("greeneye_token");
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;