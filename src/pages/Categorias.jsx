import { Col, Container, Row } from "react-bootstrap";
import CategoriaCard from "../components/CategoriaCard";
import { useProductos } from "../context/ProductosContext";

function Categorias() {
  const { categorias, productos } = useProductos();

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Navegación por categoría</p>
        <h1>Categorías</h1>
        <p className="lead">Selecciona un rubro para abrir el catálogo ya filtrado.</p>
      </header>
      <Row className="g-4">
        {categorias.map((categoria) => {
          const cantidad = productos.filter((producto) => producto.categoria === categoria).length;
          return (
            <Col xs={12} sm={6} lg={4} key={categoria}>
              <CategoriaCard categoria={categoria} cantidad={cantidad} />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default Categorias;
