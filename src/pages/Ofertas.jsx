import { Alert, Container, Spinner } from "react-bootstrap";
import ListaProductos from "../components/ListaProductos";
import { useCarrito } from "../context/CarritoContext";
import { useProductos } from "../context/ProductosContext";

function Ofertas() {
  const { productos, cargando, error } = useProductos();
  const { agregarProducto } = useCarrito();
  const productosEnOferta = productos.filter((producto) => producto.precioOferta);

  // Estados de la Guía 16: mientras carga o si la API falla no se muestra una lista engañosa
  if (cargando) return <Container className="py-5"><Spinner aria-label="Cargando productos" /></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Precios especiales</p>
        <h1>Ofertas</h1>
        <p className="lead">Productos seleccionados con precio promocional.</p>
      </header>
      <ListaProductos productos={productosEnOferta} onAgregar={agregarProducto} />
    </Container>
  );
}

export default Ofertas;
