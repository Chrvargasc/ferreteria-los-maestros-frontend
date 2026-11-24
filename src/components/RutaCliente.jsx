import { Navigate, useLocation } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import { PANEL_POR_ROL, ROL_CLIENTE } from "../utils/roles";

function RutaCliente({ children }) {
  const { usuario } = useSesion();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  // Vendedor y administrador tienen su propio panel
  if (usuario.rol !== ROL_CLIENTE) {
    return <Navigate to={PANEL_POR_ROL[usuario.rol] ?? "/"} replace />;
  }

  return children;
}

export default RutaCliente;
