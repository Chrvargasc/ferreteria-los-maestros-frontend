import { Card, Col, Form, Row } from "react-bootstrap";

function CheckoutEntregaCard({ formulario, errores, onChange }) {
  return (
    <Card className="shadow-sm mb-4">
      <Card.Body className="p-4">
        <h2 className="h4">Entrega</h2>
        <div className="d-flex flex-column gap-2 mb-3">
          <Form.Check
            type="radio"
            id="entrega-retiro"
            name="entrega"
            value="retiro"
            label="Retiro en tienda"
            checked={formulario.entrega === "retiro"}
            onChange={onChange}
          />
          <Form.Check
            type="radio"
            id="entrega-despacho"
            name="entrega"
            value="despacho"
            label="Despacho a domicilio"
            checked={formulario.entrega === "despacho"}
            onChange={onChange}
          />
        </div>

        {formulario.entrega === "despacho" && (
          <Row className="g-3">
            <Col xs={12} md={7}>
              <Form.Group controlId="checkout-calle">
                <Form.Label>Calle</Form.Label>
                <Form.Control name="calle" value={formulario.calle} onChange={onChange} isInvalid={Boolean(errores.calle)} />
                <Form.Control.Feedback type="invalid">{errores.calle}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={5}>
              <Form.Group controlId="checkout-numero">
                <Form.Label>Número</Form.Label>
                <Form.Control name="numero" value={formulario.numero} onChange={onChange} isInvalid={Boolean(errores.numero)} />
                <Form.Control.Feedback type="invalid">{errores.numero}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="checkout-comuna">
                <Form.Label>Comuna</Form.Label>
                <Form.Control name="comuna" value={formulario.comuna} onChange={onChange} isInvalid={Boolean(errores.comuna)} />
                <Form.Control.Feedback type="invalid">{errores.comuna}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="checkout-indicaciones">
                <Form.Label>Indicaciones para la entrega (opcional)</Form.Label>
                <Form.Control as="textarea" rows={3} name="indicaciones" value={formulario.indicaciones} onChange={onChange} />
              </Form.Group>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

export default CheckoutEntregaCard;
