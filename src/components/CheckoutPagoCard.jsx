import { Card, Form } from "react-bootstrap";

function CheckoutPagoCard({ usuario, formulario, errores, onChange }) {
  return (
    <Card className="shadow-sm mb-4">
      <Card.Body className="p-4">
        <h2 className="h4">Forma de pago</h2>
        <Form.Select name="formaPago" value={formulario.formaPago} onChange={onChange} isInvalid={Boolean(errores.formaPago)}>
          <option value="transferencia">Transferencia bancaria</option>
          <option value="tarjeta">Tarjeta</option>
          {usuario?.cuentaCorriente && <option value="cuenta-corriente">Cuenta corriente</option>}
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errores.formaPago}</Form.Control.Feedback>
        <p className="small texto-suave mt-2 mb-0">
          La forma de pago seleccionada quedará registrada en el resumen del pedido.
        </p>
      </Card.Body>
    </Card>
  );
}

export default CheckoutPagoCard;
