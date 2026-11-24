import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Modal, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import MetricaCard from "../components/MetricaCard";
import ProductoAdminRow from "../components/ProductoAdminRow";
import { useProductos } from "../context/ProductosContext";
import { useSesion } from "../context/SesionContext";
import { listarCategorias } from "../services/productosService";
import FormularioProducto from "./admin/FormularioProducto";

function PanelAdmin() {
  const { usuario } = useSesion();
  const {
    productos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    cargando,
    error,
  } = useProductos();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [categorias, setCategorias] = useState([]);

  // Las categorías del formulario vienen de la API (el backend exige categoria.id)
  useEffect(() => {
    async function cargarCategorias() {
      try {
        setCategorias(await listarCategorias());
      } catch (e) {
        setErrorAccion(`No se pudieron cargar las categorías: ${e.message}`);
      }
    }
    cargarCategorias();
  }, []);

  const stockBajo = productos.filter((producto) => producto.stock <= producto.stockMinimo).length;
  const metricas = [
    { titulo: "Productos", valor: productos.length },
    { titulo: "Alertas de stock", valor: stockBajo },
    { titulo: "Roles disponibles", valor: 3, descripcion: "Cliente, Vendedor y Administrador" },
  ];

  function abrirNuevo() {
    setProductoEditando(null);
    setMostrarModal(true);
  }

  function abrirEditar(producto) {
    setProductoEditando(producto);
    setMostrarModal(true);
  }

  function cerrarFormulario() {
    setMostrarModal(false);
    setProductoEditando(null);
  }

  // Devuelve el resultado al formulario para que muestre el error de la API si lo hay
  async function guardarProducto(datos) {
    const resultado = productoEditando
      ? await actualizarProducto(productoEditando.id, datos)
      : await crearProducto(datos);

    if (resultado.ok) {
      setMensaje(productoEditando ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      cerrarFormulario();
    }

    return resultado;
  }

  async function borrar(producto) {
    if (!window.confirm(`¿Eliminar ${producto.nombre}?`)) return;
    const resultado = await eliminarProducto(producto.id);
    if (resultado.ok) {
      setErrorAccion("");
      setMensaje("Producto eliminado correctamente.");
    } else {
      // Por ejemplo 409: el producto aparece en boletas
      setMensaje("");
      setErrorAccion(resultado.mensaje);
    }
  }

  // Estados de la Guía 16
  if (cargando) return <Container className="py-5"><Spinner aria-label="Cargando productos" /></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Administrador</p>
        <h1>Panel de administración</h1>
        <p className="lead">Hola, {usuario.nombre}. Gestiona productos, inventario y boletas de la tienda.</p>
      </header>

      {mensaje && <Alert variant="success" onClose={() => setMensaje("")} dismissible>{mensaje}</Alert>}
      {errorAccion && <Alert variant="danger" onClose={() => setErrorAccion("")} dismissible>{errorAccion}</Alert>}

      <Row className="g-4 mb-5">
        {metricas.map((metrica) => (
          <Col xs={12} md={4} key={metrica.titulo}>
            <MetricaCard
              valor={metrica.valor}
              titulo={metrica.titulo}
              descripcion={metrica.descripcion}
            />
          </Col>
        ))}
      </Row>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <p className="etiqueta mb-1">CRUD</p>
          <h2 className="h3 mb-0">Gestión de productos</h2>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button as={Link} to="/boletas" variant="outline-dark">Ver boletas</Button>
          <Button as={Link} to="/inventario" variant="outline-dark">Ver inventario</Button>
          <Button variant="warning" className="fw-semibold" onClick={abrirNuevo}>Nuevo producto</Button>
        </div>
      </div>

      <div className="table-responsive border rounded-3">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr><th>Código</th><th>Producto</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <ProductoAdminRow
                key={producto.id}
                producto={producto}
                onEditar={abrirEditar}
                onEliminar={borrar}
              />
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={mostrarModal} onHide={cerrarFormulario} size="lg" centered>
        {mostrarModal && (
          <FormularioProducto
            key={productoEditando?.codigo ?? "nuevo"}
            producto={productoEditando}
            categorias={categorias}
            onGuardar={guardarProducto}
            onCancelar={cerrarFormulario}
          />
        )}
      </Modal>
    </Container>
  );
}

export default PanelAdmin;
