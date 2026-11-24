import { Button, Card, Col, Row } from "react-bootstrap";
import { formatearPrecio } from "../utils/formato";

function ItemCarritoCard({ item, onCambiarCantidad, onEliminar }) {
  const { producto, precio, subtotal, cantidad } = item;

  return (
    <Card className="shadow-sm item-carrito-react">
      <Card.Body>
        <Row className="align-items-center g-3">
          <Col xs={12} sm={3}>
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid imagen-carrito-react" />
          </Col>
          <Col xs={12} sm={5}>
            <h2 className="h5">{producto.nombre}</h2>
            <p className="texto-suave mb-1">{formatearPrecio(precio)} / {producto.unidad}</p>
            <strong>Subtotal: {formatearPrecio(subtotal)}</strong>
          </Col>
          <Col xs={12} sm={4}>
            <div className="d-flex align-items-center justify-content-sm-end gap-2 mb-2">
              <Button
                variant="outline-dark"
                size="sm"
                aria-label={`Restar una unidad de ${producto.nombre}`}
                onClick={() => onCambiarCantidad(producto.codigo, cantidad - 1)}
              >
                −
              </Button>
              <span className="cantidad-carrito" aria-label={`Cantidad ${cantidad}`}>{cantidad}</span>
              <Button
                variant="outline-dark"
                size="sm"
                aria-label={`Sumar una unidad de ${producto.nombre}`}
                onClick={() => onCambiarCantidad(producto.codigo, cantidad + 1)}
              >
                +
              </Button>
            </div>
            <Button
              variant="link"
              className="text-danger p-0 d-block ms-sm-auto"
              onClick={() => onEliminar(producto.codigo)}
            >
              Eliminar
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default ItemCarritoCard;
