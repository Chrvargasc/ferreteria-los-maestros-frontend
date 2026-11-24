import { useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import { listarMisBoletas } from "../services/boletasService";
import { COLOR_ESTADO } from "./PanelVendedor";
import { formatearPrecio } from "../utils/formato";
import { NOMBRE_ROL } from "../utils/roles";

function PanelCliente() {
  const { usuario } = useSesion();
  // Guía 17: compras reales del cliente (GET /boletas/mias filtra por el id del token).
  // En la EP2 esta tabla mostraba pedidos de ejemplo (#1042, #1037) a cualquier cliente
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setCompras(await listarMisBoletas());
      } catch (e) {
        setError(`No se pudieron cargar tus compras: ${e.message}`);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Mi cuenta</p>
        <h1>Hola, {usuario.nombre}</h1>
        <p className="lead texto-suave">
          Revisa tus datos de cliente y la información asociada a tus compras.
        </p>
      </header>

      <Row className="g-4 mb-5">
        <Col xs={12} md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Tipo de cliente</Card.Title>
              <p className="dato-panel">{usuario.tipoCliente}</p>
              <Badge bg="secondary">{NOMBRE_ROL[usuario.rol] ?? usuario.rol}</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Cuenta corriente</Card.Title>
              <p className="dato-panel">{usuario.cuentaCorriente ? "Habilitada" : "No habilitada"}</p>
              <p className="texto-suave mb-0">
                {usuario.cuentaCorriente
                  ? "Tus compras con cuenta corriente pueden registrarse como saldo pendiente."
                  : "Consulta en tienda si necesitas solicitar una cuenta corriente."}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Datos de contacto</Card.Title>
              <p className="mb-1">{usuario.correo}</p>
              <p className="mb-0">{usuario.telefono}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <section aria-labelledby="titulo-compras">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <p className="etiqueta mb-1">Historial</p>
            <h2 id="titulo-compras" className="h3 mb-0">Compras recientes</h2>
          </div>
          <Link className="btn btn-dark" to="/catalogo">Ir al catálogo</Link>
        </div>

        {cargando && <Spinner aria-label="Cargando tus compras" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {!cargando && !error && compras.length === 0 && <Alert variant="info">Aún no tienes compras.</Alert>}
        {compras.length > 0 && (
          <div className="table-responsive border rounded-3">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th scope="col">Boleta</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Entrega</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((boleta) => (
                  <tr key={boleta.id}>
                    <td>{boleta.numero}</td>
                    <td>{new Date(boleta.fecha).toLocaleDateString("es-CL")}</td>
                    <td className="text-capitalize">{boleta.entrega}</td>
                    <td><Badge bg={COLOR_ESTADO[boleta.estado] ?? "secondary"}>{boleta.estado}</Badge></td>
                    <td>{formatearPrecio(boleta.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </section>
    </Container>
  );
}

export default PanelCliente;
