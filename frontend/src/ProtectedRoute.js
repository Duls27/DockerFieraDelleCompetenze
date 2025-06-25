import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');

  if (!token) {
    // Se non c'è token, reindirizza a /login
    return <Navigate to="/AdminLogin" replace />;
  }

  // Se c'è token, mostra il componente figlio (la pagina protetta)
  return children;
};

export default ProtectedRoute;