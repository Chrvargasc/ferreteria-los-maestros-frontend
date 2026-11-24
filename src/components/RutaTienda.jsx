import { Navigate, Outlet } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import { ROL_VENDEDOR } from "../utils/roles";

// Vistas de la tienda (inicio, catálogo, ofertas, carrito, checkout, registro...).
// Las ven invitados, clientes y el administrador (acceso total). El vendedor solo ve
// productos y boletas (Anexo 1), así que se le devuelve a su panel.
// Mismo patrón de RutaProtegida de la Guía 17: <Outlet /> renderiza la ruta hija autorizada.
function RutaTienda() {
  const { usuario } = useSesion();

  if (usuario?.rol === ROL_VENDEDOR) {
    return <Navigate to="/vendedor" replace />;
  }

  return <Outlet />;
}

export default RutaTienda;
