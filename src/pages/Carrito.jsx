import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import ItemCarritoCard from "../components/ItemCarritoCard";
import { useCarrito } from "../context/CarritoContext";
import { useProductos } from "../context/ProductosContext";
import { formatearPrecio } from "../utils/formato";

function Carrito() {
  const { carrito, mensaje, cambiarCantidad, eliminarProducto, vaciarCarrito } = useCarrito();
  const { buscarProducto } = useProductos();

  const items = carrito
    .map((item) => {
      const producto = buscarProducto(item.codigo);
      if (!producto) return null;
      const precio = producto.precioOferta ?? producto.precio;
      return { ...item, producto, precio, subtotal: precio * item.cantidad };
    })
    .filter(Boolean);

  const total = items.reduce((suma, item) => suma + item.subtotal, 0);

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Compra</p>
        <h1>Mi pedido</h1>
        <p className="lead">Aumenta o disminuye cantidades y revisa el total antes del checkout.</p>
      </header>

      {mensaje && <Alert variant="info" role="status">{mensaje}</Alert>}

      {items.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="p-5 text-center">
            <h2 className="h4">Tu pedido está vacío</h2>
            <p className="texto-suave">Agrega productos desde el catálogo para comenzar.</p>
            <Button as={Link} to="/catalogo" variant="warning" className="fw-semibold">Ir al catálogo</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <div className="d-grid gap-3">
              {items.map((item) => (
                <ItemCarritoCard
                  key={item.producto.codigo}
                  item={item}
                  onCambiarCantidad={cambiarCantidad}
                  onEliminar={eliminarProducto}
                />
              ))}
            </div>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="shadow-sm sticky-lg-top resumen-carrito-react">
              <Card.Body className="p-4">
                <h2 className="h4">Resumen</h2>
                <div className="d-flex justify-content-between fs-4 fw-bold border-top border-bottom py-3 my-3">
                  <span>Total</span>
                  <span>{formatearPrecio(total)}</span>
                </div>
                <div className="d-grid gap-2">
                  <Button as={Link} to="/checkout" variant="warning" size="lg" className="fw-semibold">Continuar al checkout</Button>
                  <Button as={Link} to="/catalogo" variant="outline-dark">Seguir comprando</Button>
                  <Button variant="outline-danger" onClick={vaciarCarrito}>Vaciar pedido</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Carrito;
