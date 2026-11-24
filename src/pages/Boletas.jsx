import { Fragment, useEffect, useState } from "react";
import { Alert, Badge, Button, Container, Spinner, Table } from "react-bootstrap";
import { useProductos } from "../context/ProductosContext";
import { useSesion } from "../context/SesionContext";
import { anularBoleta, listarBoletas, listarDetallesBoleta } from "../services/boletasService";
import { formatearPrecio } from "../utils/formato";
import { ROL_ADMINISTRADOR } from "../utils/roles";
import { COLOR_ESTADO } from "./PanelVendedor";

// Guía 17: boletas (órdenes) con su detalle. La ven VENDEDOR y ADMINISTRADOR;
// solo ADMINISTRADOR puede anular (el backend responde 403 al vendedor)
function Boletas() {
  const { usuario } = useSesion();
  const { recargarProductos } = useProductos();
  const [boletas, setBoletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  // Detalles ya cargados, por id de boleta: { 3: [...] }. Se piden recién al abrir cada boleta
  const [detalles, setDetalles] = useState({});
  const [abierta, setAbierta] = useState(null);
  const esAdministrador = usuario.rol === ROL_ADMINISTRADOR;

  async function cargarBoletas() {
    try {
      setError("");
      const lista = await listarBoletas();
      setBoletas([...lista].sort((a, b) => b.id - a.id));
    } catch (e) {
      setError(`No se pudieron cargar las boletas: ${e.message}`);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarBoletas();
  }, []);

  async function verDetalle(boleta) {
    if (abierta === boleta.id) {
      setAbierta(null);
      return;
    }
    setAbierta(boleta.id);
    if (detalles[boleta.id]) return;
    try {
      const lista = await listarDetallesBoleta(boleta.id);
      setDetalles((actual) => ({ ...actual, [boleta.id]: lista }));
    } catch (e) {
      setError(`No se pudo cargar el detalle: ${e.message}`);
    }
  }

  async function anular(boleta) {
    if (!window.confirm(`¿Anular la boleta ${boleta.numero}? El stock de sus productos se devolverá.`)) return;
    try {
      await anularBoleta(boleta.id);
      setMensaje(`Boleta ${boleta.numero} anulada.`);
      await cargarBoletas();
      recargarProductos(); // el stock devuelto se ve en catálogo e inventario
    } catch (e) {
      setMensaje("");
      setError(e.message);
    }
  }

  if (cargando) return <Container className="py-5"><Spinner aria-label="Cargando boletas" /></Container>;

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Ventas</p>
        <h1>Boletas</h1>
        <p className="lead">Órdenes registradas en la tienda, con el detalle de sus productos.</p>
      </header>

      {mensaje && <Alert variant="success" onClose={() => setMensaje("")} dismissible>{mensaje}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {!error && boletas.length === 0 && <Alert variant="info">Aún no hay boletas registradas.</Alert>}

      {boletas.length > 0 && (
        <div className="table-responsive border rounded-3">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr><th>Boleta</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {boletas.map((boleta) => (
                <Fragment key={boleta.id}>
                  <tr>
                    <td>{boleta.numero}</td>
                    <td>{new Date(boleta.fecha).toLocaleString("es-CL")}</td>
                    <td>
                      {boleta.nombreCliente}
                      {/* usuarioId null = compra como invitado */}
                      <div className="small texto-suave">{boleta.usuarioId ? `Cliente #${boleta.usuarioId}` : "Invitado"}</div>
                    </td>
                    <td className="text-capitalize">{boleta.entrega}</td>
                    <td>{formatearPrecio(boleta.total)}</td>
                    <td><Badge bg={COLOR_ESTADO[boleta.estado] ?? "secondary"}>{boleta.estado}</Badge></td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Button size="sm" variant="outline-dark" onClick={() => verDetalle(boleta)}>
                          {abierta === boleta.id ? "Ocultar detalle" : "Ver detalle"}
                        </Button>
                        {esAdministrador && boleta.estado !== "ANULADA" && (
                          <Button size="sm" variant="outline-danger" onClick={() => anular(boleta)}>Anular</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {abierta === boleta.id && (
                    <tr>
                      <td colSpan={7} className="bg-light">
                        <p className="mb-2">
                          <strong>Contacto:</strong> {boleta.correoCliente} · {boleta.telefonoCliente}
                          {" · "}<strong>Pago:</strong> {boleta.formaPago}
                        </p>
                        {boleta.entrega === "despacho" && (
                          <p className="mb-2">
                            <strong>Dirección:</strong> {boleta.calle} {boleta.numeroDireccion}, {boleta.comuna}
                            {boleta.indicaciones ? ` (${boleta.indicaciones})` : ""}
                          </p>
                        )}
                        {!detalles[boleta.id] ? (
                          <Spinner size="sm" aria-label="Cargando detalle" />
                        ) : (
                          <Table size="sm" className="mb-0" aria-label={`Detalle de la boleta ${boleta.numero}`}>
                            <thead><tr><th>Código</th><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
                            <tbody>
                              {detalles[boleta.id].map((detalle) => (
                                <tr key={detalle.id}>
                                  <td>{detalle.producto.codigo}</td>
                                  <td>{detalle.producto.nombre}</td>
                                  <td>{detalle.cantidad}</td>
                                  <td>{formatearPrecio(detalle.precioUnitario)}</td>
                                  <td>{formatearPrecio(detalle.subtotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default Boletas;
