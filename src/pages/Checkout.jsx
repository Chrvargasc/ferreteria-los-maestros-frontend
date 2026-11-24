import { useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CheckoutClienteCard from "../components/CheckoutClienteCard";
import CheckoutEntregaCard from "../components/CheckoutEntregaCard";
import CheckoutPagoCard from "../components/CheckoutPagoCard";
import ResumenCheckoutCard from "../components/ResumenCheckoutCard";
import { useSesion } from "../context/SesionContext";
import { useProductos } from "../context/ProductosContext";
import { useCarrito } from "../context/CarritoContext";
import { validarCheckout } from "../utils/validaciones";
import { aPedido, aSolicitudBoleta, crearBoleta } from "../services/boletasService";

const CLAVE_ULTIMO_PEDIDO = "ferreteriaUltimoPedidoReact";

function Checkout() {
  const { usuario } = useSesion();
  const { productos, recargarProductos } = useProductos();
  const { carrito, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");
  const [formulario, setFormulario] = useState({
    nombre: usuario?.nombre ?? "",
    correo: usuario?.correo ?? "",
    telefono: usuario?.telefono ?? "",
    entrega: "retiro",
    calle: "",
    numero: "",
    comuna: "La Serena",
    indicaciones: "",
    formaPago: usuario?.cuentaCorriente ? "cuenta-corriente" : "transferencia",
  });

  const items = useMemo(() => {
    return carrito
      .map((item) => {
        const producto = productos.find((actual) => actual.codigo === item.codigo);
        if (!producto) return null;
        const cantidad = Number(item.cantidad) || 0;
        const precioUnitario = producto.precioOferta ?? producto.precio;
        return { ...item, producto, cantidad, precioUnitario, subtotal: precioUnitario * cantidad };
      })
      .filter(Boolean)
      .filter((item) => item.cantidad > 0);
  }, [carrito, productos]);

  const total = items.reduce((acumulado, item) => acumulado + item.subtotal, 0);

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: "" }));
  }

  async function procesarCompra(evento) {
    evento.preventDefault();
    const nuevosErrores = validarCheckout(formulario);

    if (items.length === 0) {
      nuevosErrores.carrito = "Agrega al menos un producto antes de continuar con la compra.";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // Guía 16: la compra se registra como boleta en el backend, que valida stock,
    // calcula el total con ofertas y descuenta el stock
    setEnviando(true);
    setErrorCompra("");
    try {
      // Si hay sesión, api.js envía el token y el backend asocia la boleta al usuario (claim "id")
      const boleta = await crearBoleta(aSolicitudBoleta(formulario, items));
      // La respuesta del POST ya trae los detalles: GET /boletas/{id}/detalles es solo para
      // vendedor y administrador, así que un cliente o un invitado no podría pedirlos
      // Confirmación lee el último pedido desde localStorage (así sobrevive a una recarga)
      localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(aPedido(boleta, boleta.detalles)));
      vaciarCarrito();
      recargarProductos(); // para ver el stock ya descontado
      navigate("/compra-exitosa");
    } catch (e) {
      // Por ejemplo 409 por stock insuficiente o falta de conexión
      setErrorCompra(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Container className="py-5">
      <header className="mb-4">
        <p className="etiqueta">Finalizar compra</p>
        <h1>Checkout</h1>
        <p className="lead">Confirma tus productos, datos de contacto y opción de entrega.</p>
      </header>

      {errores.carrito && <Alert variant="warning">{errores.carrito}</Alert>}
      {errorCompra && <Alert variant="danger">{errorCompra}</Alert>}

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Form noValidate onSubmit={procesarCompra}>
            <CheckoutClienteCard
              usuario={usuario}
              formulario={formulario}
              errores={errores}
              onChange={actualizarCampo}
            />
            <CheckoutEntregaCard
              formulario={formulario}
              errores={errores}
              onChange={actualizarCampo}
            />
            <CheckoutPagoCard
              usuario={usuario}
              formulario={formulario}
              errores={errores}
              onChange={actualizarCampo}
            />
            <Button type="submit" variant="warning" size="lg" className="fw-semibold" disabled={enviando}>
              {enviando ? "Procesando compra..." : "Confirmar compra"}
            </Button>
          </Form>
        </Col>

        <Col xs={12} lg={5}>
          <ResumenCheckoutCard items={items} total={total} />
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
