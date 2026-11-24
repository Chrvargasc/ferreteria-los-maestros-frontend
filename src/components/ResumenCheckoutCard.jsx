import { Button, Card, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formato";

function ResumenCheckoutCard({ items, total }) {
  return (
    <Card className="shadow-sm resumen-checkout sticky-lg-top">
      <Card.Body className="p-4">
        <h2 className="h4">Resumen del pedido</h2>
        {items.length === 0 ? (
          <div>
            <p className="texto-suave">No hay productos en tu pedido.</p>
            <Button as={Link} to="/catalogo" variant="outline-dark">Agregar productos</Button>
          </div>
        ) : (
          <div className="table-responsive">
            <Table size="sm" className="align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.producto.codigo}>
                    <td>{item.producto.nombre}</td>
                    <td className="text-center">{item.cantidad}</td>
                    <td className="text-end">{formatearPrecio(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between fs-5 fw-bold border-top pt-3">
              <span>Total</span>
              <span>{formatearPrecio(total)}</span>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default ResumenCheckoutCard;
