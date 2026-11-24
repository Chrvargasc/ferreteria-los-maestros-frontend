import { useMemo, useState } from "react";
import { Alert, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import ListaProductos from "../components/ListaProductos";
import { useCarrito } from "../context/CarritoContext";
import { useProductos } from "../context/ProductosContext";
import { normalizarTexto } from "../utils/formato";

function Catalogo() {
  const { productos, categorias, cargando, error } = useProductos();
  const { mensaje, agregarProducto } = useCarrito();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaInicial = searchParams.get("categoria") ?? "Todas";
  const [busqueda, setBusqueda] = useState("");
  // Los productos llegan después del primer render: la categoría de la URL se valida al filtrar
  const [categoriaElegida, setCategoria] = useState(categoriaInicial);
  const categoria = categorias.includes(categoriaElegida) ? categoriaElegida : "Todas";

  const productosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    return productos.filter((producto) => {
      const coincideCategoria = categoria === "Todas" || producto.categoria === categoria;
      const datosBuscables = normalizarTexto(`${producto.nombre} ${producto.marca} ${producto.codigo} ${producto.categoria}`);
      return coincideCategoria && (texto === "" || datosBuscables.includes(texto));
    });
  }, [productos, busqueda, categoria]);

  function cambiarCategoria(evento) {
    const nuevaCategoria = evento.target.value;
    setCategoria(nuevaCategoria);
    setSearchParams(nuevaCategoria === "Todas" ? {} : { categoria: nuevaCategoria });
  }

  // Estados de la Guía 16: mientras carga o si la API falla no se muestra una lista engañosa
  if (cargando) return <Container className="py-5"><Spinner aria-label="Cargando productos" /></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">{productos.length} productos disponibles</p>
        <h1>Catálogo</h1>
        <p className="lead">Busca por nombre, marca, código o categoría y revisa el stock disponible.</p>
      </header>

      {mensaje && <Alert variant="info" role="status">{mensaje}</Alert>}

      <section className="filtros-react p-4 rounded-4 mb-4" aria-labelledby="titulo-filtros">
        <h2 id="titulo-filtros" className="h4 mb-3">Buscar productos</h2>
        <Row className="g-3">
          <Col xs={12} md={7}>
            <Form.Group controlId="buscar-producto">
              <Form.Label>Nombre, marca o código</Form.Label>
              <Form.Control
                type="search"
                placeholder="Ejemplo: cemento, Stanley o HM001"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={5}>
            <Form.Group controlId="categoria-producto">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={categoria} onChange={cambiarCategoria}>
                <option value="Todas">Todas</option>
                {categorias.map((c) => <option value={c} key={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </section>

      <p className="mensaje-estado" role="status" aria-live="polite">
        Mostrando {productosFiltrados.length} producto(s).
      </p>

      {productosFiltrados.length === 0 ? (
        <Alert variant="warning">No encontramos productos que coincidan con los filtros seleccionados.</Alert>
      ) : (
        <ListaProductos productos={productosFiltrados} onAgregar={agregarProducto} />
      )}
    </Container>
  );
}

export default Catalogo;
