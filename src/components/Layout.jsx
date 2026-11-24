import { Alert, Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import Cabecera from "./Cabecera";
import PiePagina from "./PiePagina";

function Layout() {
  // Guía 17: si el token expiró se muestra el aviso en la página actual. En la tienda el usuario
  // sigue navegando sin sesión; en una ruta protegida RutaRol lo lleva a /login y el aviso aparece ahí
  const { aviso, limpiarAviso } = useSesion();

  return (
    <div className="d-flex flex-column min-vh-100">
      <a className="salto-contenido" href="#contenido-principal">
        Saltar al contenido principal
      </a>
      <Cabecera />
      <main id="contenido-principal" className="flex-grow-1">
        {aviso && (
          <Container className="pt-4">
            <Alert variant="warning" onClose={limpiarAviso} dismissible className="mb-0">
              {aviso}
            </Alert>
          </Container>
        )}
        <Outlet />
      </main>
      <PiePagina />
    </div>
  );
}

export default Layout;
