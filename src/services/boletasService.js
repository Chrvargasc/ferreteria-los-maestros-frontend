import { API_URL, llamarApi } from "./api";

const URL_BOLETAS = `${API_URL}/boletas`;

// Arma el JSON de BoletaRequest. Solo se envían productoId y cantidad:
// el precio, el total y el descuento de stock los calcula el backend.
// No se envía usuarioId (Guía 17): el backend lo toma del token si hay sesión.
export function aSolicitudBoleta(formulario, items) {
  const despacho = formulario.entrega === "despacho";
  return {
    nombreCliente: formulario.nombre.trim(),
    correoCliente: formulario.correo.trim(),
    telefonoCliente: formulario.telefono.trim(),
    entrega: formulario.entrega,
    calle: despacho ? formulario.calle.trim() : null,
    numeroDireccion: despacho ? formulario.numero.trim() : null,
    comuna: despacho ? formulario.comuna.trim() : null,
    indicaciones: despacho ? formulario.indicaciones.trim() : null,
    formaPago: formulario.formaPago,
    items: items.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })),
  };
}

// Convierte la boleta y sus detalles (respuesta del POST /boletas) al pedido que muestra Confirmación
export function aPedido(boleta, detalles) {
  return {
    numero: boleta.numero,
    fecha: boleta.fecha,
    cliente: {
      nombre: boleta.nombreCliente,
      correo: boleta.correoCliente,
      telefono: boleta.telefonoCliente,
    },
    entrega: boleta.entrega,
    direccion: boleta.entrega === "despacho"
      ? { calle: boleta.calle, numero: boleta.numeroDireccion, comuna: boleta.comuna, indicaciones: boleta.indicaciones }
      : null,
    formaPago: boleta.formaPago,
    items: detalles.map((detalle) => ({
      codigo: detalle.producto.codigo,
      nombre: detalle.producto.nombre,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
      subtotal: detalle.subtotal,
    })),
    total: boleta.total,
    estado: boleta.estado === "RECIBIDA" ? "Recibida - pendiente de confirmación" : boleta.estado,
  };
}

export async function crearBoleta(solicitud) {
  return llamarApi(URL_BOLETAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solicitud),
  });
}

export async function listarDetallesBoleta(id) {
  return llamarApi(`${URL_BOLETAS}/${id}/detalles`);
}

// Guía 17: compras del cliente con sesión. No envía id: el backend usa el del token
export async function listarMisBoletas() {
  return llamarApi(`${URL_BOLETAS}/mias`);
}

// Guía 17: solo VENDEDOR y ADMINISTRADOR (el backend responde 401/403 a los demás)
export async function listarBoletas() {
  return llamarApi(URL_BOLETAS);
}

// Solo ADMINISTRADOR. No borra: deja la boleta ANULADA y el backend devuelve el stock
export async function anularBoleta(id) {
  return llamarApi(`${URL_BOLETAS}/${id}`, { method: "DELETE" });
}
