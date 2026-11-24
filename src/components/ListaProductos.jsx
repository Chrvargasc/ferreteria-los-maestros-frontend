import { Col, Row } from "react-bootstrap";
import ProductoCard from "./ProductoCard";

function ListaProductos({ productos, onAgregar, mostrarAgregar = true }) {
  return (
    <Row className="g-4">
      {productos.map((producto) => (
        <Col xs={12} md={6} lg={4} key={producto.codigo}>
          <ProductoCard
            producto={producto}
            onAgregar={onAgregar}
            mostrarAgregar={mostrarAgregar}
          />
        </Col>
      ))}
    </Row>
  );
}

export default ListaProductos;
