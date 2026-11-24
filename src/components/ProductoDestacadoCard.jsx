import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function ProductoDestacadoCard({ producto }) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={producto.imagen}
        alt={producto.nombre}
        className="imagen-destacada"
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{producto.nombre}</Card.Title>
        <Card.Text className="texto-suave">{producto.descripcion}</Card.Text>
        <Button as={Link} to={`/producto/${producto.codigo}`} variant="dark" className="mt-auto">
          Ver detalle
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductoDestacadoCard;
