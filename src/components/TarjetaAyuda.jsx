import { Card } from "react-bootstrap";

function TarjetaAyuda({ titulo, texto }) {
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        <Card.Title>{titulo}</Card.Title>
        <Card.Text>{texto}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default TarjetaAyuda;
