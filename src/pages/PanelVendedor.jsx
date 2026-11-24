import { useEffect, useState } from "react";
import { Alert, Badge, Button, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import MetricaCard from "../components/MetricaCard";
import { useProductos } from "../context/ProductosContext";
import { useSesion } from "../context/SesionContext";
import { listarBoletas } from "../services/boletasService";
import { formatearPrecio } from "../utils/formato";

// Antes PanelEmpleado (EP2, con pedidos de ejemplo). Desde la Guía 17 el rol se llama Vendedor
// y los pedidos son las boletas reales de la API (GET /boletas exige VENDEDOR o ADMINISTRADOR)
export const COLOR_ESTADO = {
  RECIBIDA: "warning",
  CONFIRMADA: "primary",
  ENTREGADA: "success",
  ANULADA: "secondary",
};

function PanelVendedor() {
  const { usuario } = useSesion();
  const { productos } = useProductos();
  const [boletas, setBoletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setBoletas(await listarBoletas());
      } catch (e) {
        setError(`No se pudieron cargar las boletas: ${e.message}`);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const stockBajo = productos.filter((producto) => producto.stock <= producto.stockMinimo).length;
  const hoy = new Date().toDateString();
  const metricas = [
    { titulo: "Boletas por confirmar", valor: boletas.filter((b) => b.estado === "RECIBIDA").length },
    { titulo: "Productos con stock bajo", valor: stockBajo },
    { titulo: "Boletas registradas hoy", valor: boletas.filter((b) => new Date(b.fecha).toDateString() === hoy).length },
  ];
  // Las 5 más recientes (el id crece con cada boleta)
  const recientes = [...boletas].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Vendedor</p>
        <h1>Panel de trabajo</h1>
        <p className="lead">Hola, {usuario.nombre}. Revisa boletas e inventario.</p>
      </header>

      <Row className="g-4 mb-5">
        {metricas.map((metrica) => (
          <Col xs={12} md={4} key={metrica.titulo}>
            <MetricaCard valor={metrica.valor} titulo={metrica.titulo} />
          </Col>
        ))}
      </Row>

      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center mb-3">
        <h2 className="h3 mb-0">Boletas recientes</h2>
        <div className="d-flex flex-wrap gap-2">
          <Button as={Link} to="/boletas" variant="outline-dark">Ver todas las boletas</Button>
          <Button as={Link} to="/inventario" variant="warning" className="fw-semibold">Revisar inventario</Button>
        </div>
      </div>

      {cargando && <Spinner aria-label="Cargando boletas" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!cargando && !error && recientes.length === 0 && <Alert variant="info">Aún no hay boletas registradas.</Alert>}
      {recientes.length > 0 && (
        <div className="table-responsive border rounded-3">
          <Table hover className="mb-0 align-middle">
            <thead><tr><th>Boleta</th><th>Cliente</th><th>Entrega</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {recientes.map((boleta) => (
                <tr key={boleta.id}>
                  <td>{boleta.numero}</td>
                  <td>{boleta.nombreCliente}</td>
                  <td className="text-capitalize">{boleta.entrega}</td>
                  <td>{formatearPrecio(boleta.total)}</td>
                  <td><Badge bg={COLOR_ESTADO[boleta.estado] ?? "secondary"}>{boleta.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default PanelVendedor;
