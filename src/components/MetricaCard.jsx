import { Card } from "react-bootstrap";

function MetricaCard({ valor, titulo, descripcion }) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <span className="dato-grande">{valor}</span>
        <Card.Title>{titulo}</Card.Title>
        {descripcion && <p className="texto-suave mb-0">{descripcion}</p>}
      </Card.Body>
    </Card>
  );
}

export default MetricaCard;
