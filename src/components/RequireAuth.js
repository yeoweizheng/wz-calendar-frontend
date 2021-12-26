import * as React from 'react';
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../services/auth";

export default function RequireAuth({children}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if(!isAuthenticated()) {
    return <Navigate to="/login" state={{ fromLocation: location }}/>;
  }
  return children;
}