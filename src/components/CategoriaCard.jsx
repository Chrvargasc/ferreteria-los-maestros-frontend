import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function CategoriaCard({
  categoria,
  cantidad,
  textoBoton = "Ver productos",
  variante = "warning",
  comoBoton = false,
}) {
  const destino = `/catalogo?categoria=${encodeURIComponent(categoria)}`;

  return (
    <Card className="h-100 shadow-sm tarjeta-categoria">
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h5">{categoria}</Card.Title>
        <Card.Text className="texto-suave">
          {cantidad} producto{cantidad === 1 ? "" : "s"} disponible{cantidad === 1 ? "" : "s"}.
        </Card.Text>
        {comoBoton ? (
          <Button as={Link} to={destino} variant={variante} className="fw-semibold mt-auto">
            {textoBoton}
          </Button>
        ) : (
          <Link className={`btn btn-${variante} fw-semibold mt-auto`} to={destino}>
            {textoBoton}
          </Link>
        )}
      </Card.Body>
    </Card>
  );
}

export default CategoriaCard;
