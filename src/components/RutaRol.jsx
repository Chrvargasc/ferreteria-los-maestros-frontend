import { Navigate, useLocation } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import { PANEL_POR_ROL } from "../utils/roles";

// Guía 17 (RutaProtegida): mejora la navegación, pero la seguridad real está en el backend.
// Alterar sessionStorage no permite pasar las reglas hasRole del servidor.
function RutaRol({ roles, children }) {
  const { usuario } = useSesion();
  const location = useLocation();

  // Sin sesión (o sesión expirada): al login, recordando a dónde quería ir
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  // Con sesión pero sin el rol: a su propio panel
  if (!roles.includes(usuario.rol)) {
    return <Navigate to={PANEL_POR_ROL[usuario.rol] ?? "/"} replace />;
  }

  return children;
}

export default RutaRol;
