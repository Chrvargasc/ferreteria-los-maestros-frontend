import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import { useCarrito } from "../context/CarritoContext";
import { NOMBRE_PANEL, PANEL_POR_ROL, ROL_ADMINISTRADOR, ROL_VENDEDOR } from "../utils/roles";

function Cabecera() {
  const { usuario, cerrarSesion } = useSesion();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const claseEnlace = ({ isActive }) => `nav-link enlace-menu${isActive ? " activo" : ""}`;

  // Cerrar sesión borra token y usuario de sessionStorage (trabajo autónomo de la Guía 17)
  function salir() { cerrarSesion(); navigate("/"); }
  const rutaPanel = PANEL_POR_ROL[usuario?.rol] ?? "/";
  const nombrePanel = NOMBRE_PANEL[usuario?.rol] ?? "Mi cuenta";
  // Boletas: solo Vendedor y Administrador (el backend también lo exige)
  const veBoletas = usuario?.rol === ROL_VENDEDOR || usuario?.rol === ROL_ADMINISTRADOR;
  // Anexo 1: el vendedor solo ve productos y órdenes; el menú de la tienda no le aparece
  const esVendedor = usuario?.rol === ROL_VENDEDOR;

  return (
    <Navbar expand="lg" className="cabecera-sitio" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={NavLink} to={esVendedor ? "/vendedor" : "/"} className="marca">Ferretería Los Maestros</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            {esVendedor ? (
              <>
                <NavLink to="/vendedor" className={claseEnlace}>Panel vendedor</NavLink>
                <NavLink to="/inventario" className={claseEnlace}>Productos</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" end className={claseEnlace}>Inicio</NavLink>
                <NavLink to="/catalogo" className={claseEnlace}>Catálogo</NavLink>
                <NavLink to="/ofertas" className={claseEnlace}>Ofertas</NavLink>
                <NavLink to="/carrito" className={claseEnlace}>Mi pedido {cantidadTotal > 0 && <Badge bg="warning" text="dark" className="ms-1">{cantidadTotal}</Badge>}</NavLink>
              </>
            )}
            {usuario ? (
              <>
                {veBoletas && <NavLink to="/boletas" className={claseEnlace}>Boletas</NavLink>}
                {!esVendedor && <NavLink to={rutaPanel} className={claseEnlace}>{nombrePanel}</NavLink>}
                <Button variant="outline-light" size="sm" onClick={salir}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={claseEnlace}>Iniciar sesión</NavLink>
                <Button as={NavLink} to="/registro" variant="warning" size="sm" className="fw-semibold">Crear cuenta</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Cabecera;
