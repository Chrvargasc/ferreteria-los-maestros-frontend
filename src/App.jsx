import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RutaCliente from "./components/RutaCliente";
import RutaRol from "./components/RutaRol";
import RutaTienda from "./components/RutaTienda";
import Inicio from "./pages/Inicio";
import Catalogo from "./pages/Catalogo";
import Categorias from "./pages/Categorias";
import DetalleProducto from "./pages/DetalleProducto";
import Ofertas from "./pages/Ofertas";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import PanelCliente from "./pages/PanelCliente";
import Checkout from "./pages/Checkout";
import Confirmacion from "./pages/Confirmacion";
import PagoError from "./pages/PagoError";
import Carrito from "./pages/Carrito";
import Inventario from "./pages/Inventario";
import PanelVendedor from "./pages/PanelVendedor";
import Boletas from "./pages/Boletas";
import PanelAdmin from "./pages/PanelAdmin";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada";
import { ROL_ADMINISTRADOR, ROL_VENDEDOR } from "./utils/roles";

// Guía 17: los roles son los que entrega Auth. "Empleado" de la EP2 pasó a ser VENDEDOR
const PERSONAL = [ROL_VENDEDOR, ROL_ADMINISTRADOR];

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Tienda: invitado, cliente y administrador. El vendedor vuelve a /vendedor */}
        <Route element={<RutaTienda />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-exitosa" element={<Confirmacion />} />
          <Route path="/pago-error" element={<PagoError />} />
        </Route>
        {/* Detalle de producto: lo ven todos (al vendedor se le ocultan los controles de compra) */}
        <Route path="/producto/:codigo" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        {/* Solo CLIENTE: vendedor y administrador vuelven a su panel */}
        <Route path="/mi-cuenta" element={<RutaCliente><PanelCliente /></RutaCliente>} />
        {/* Personal: un CLIENTE que entre aquí vuelve a /mi-cuenta */}
        <Route path="/vendedor" element={<RutaRol roles={PERSONAL}><PanelVendedor /></RutaRol>} />
        <Route path="/inventario" element={<RutaRol roles={PERSONAL}><Inventario /></RutaRol>} />
        <Route path="/boletas" element={<RutaRol roles={PERSONAL}><Boletas /></RutaRol>} />
        <Route path="/admin" element={<RutaRol roles={[ROL_ADMINISTRADOR]}><PanelAdmin /></RutaRol>} />
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Routes>
  );
}

export default App;
