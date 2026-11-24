import { Alert, Card, Col, Form, Row } from "react-bootstrap";

function CheckoutClienteCard({ usuario, formulario, errores, onChange }) {
  return (
    <Card className="shadow-sm mb-4">
      <Card.Body className="p-4">
        <h2 className="h4">Información del cliente</h2>
        {usuario && (
          <Alert variant="light" className="border">
            Tus datos de sesión se completaron automáticamente. Puedes ajustarlos para este pedido.
          </Alert>
        )}
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group controlId="checkout-nombre">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control name="nombre" value={formulario.nombre} onChange={onChange} isInvalid={Boolean(errores.nombre)} />
              <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="checkout-correo">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" name="correo" value={formulario.correo} onChange={onChange} isInvalid={Boolean(errores.correo)} />
              <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="checkout-telefono">
              <Form.Label>Celular</Form.Label>
              <Form.Control name="telefono" value={formulario.telefono} onChange={onChange} isInvalid={Boolean(errores.telefono)} />
              <Form.Control.Feedback type="invalid">{errores.telefono}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default CheckoutClienteCard;
