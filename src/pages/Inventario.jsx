import { useMemo, useState } from "react";
import { Alert, Badge, Container, Form, Spinner, Table } from "react-bootstrap";
import FilaInventario from "../components/FilaInventario";
import { useProductos } from "../context/ProductosContext";
import { normalizarTexto } from "../utils/formato";

function Inventario() {
  const { productos, cargando, error } = useProductos();
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    return productos.filter((producto) =>
      normalizarTexto(`${producto.codigo} ${producto.nombre} ${producto.categoria}`).includes(texto)
    );
  }, [productos, busqueda]);

  const stockBajo = productos.filter((producto) => producto.stock <= producto.stockMinimo).length;

  // Estados de la Guía 16: mientras carga o si la API falla no se muestra una lista engañosa
  if (cargando) return <Container className="py-5"><Spinner aria-label="Cargando productos" /></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Vista interna</p>
        <h1>Inventario</h1>
        <p className="lead">Consulta el stock disponible y detecta productos que requieren reposición. Haz clic en un producto para ver su detalle.</p>
      </header>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Badge bg="dark" className="p-2">{productos.length} productos</Badge>
        <Badge bg={stockBajo ? "warning" : "success"} text={stockBajo ? "dark" : undefined} className="p-2">
          {stockBajo} con stock bajo
        </Badge>
      </div>

      <Form.Group controlId="buscar-inventario" className="mb-3">
        <Form.Label>Buscar por código, producto o categoría</Form.Label>
        <Form.Control
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ejemplo: HE001, taladro o gasfitería"
        />
      </Form.Group>

      <p role="status" className="texto-suave">Mostrando {filtrados.length} producto(s).</p>

      <div className="table-responsive border rounded-3" tabIndex="0" aria-label="Tabla de inventario desplazable horizontalmente">
        <Table hover className="mb-0 align-middle">
          <caption className="visually-hidden">Stock de productos</caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col">Stock</th>
              <th scope="col">Mínimo</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((producto) => (
              <FilaInventario key={producto.codigo} producto={producto} />
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}

export default Inventario;
