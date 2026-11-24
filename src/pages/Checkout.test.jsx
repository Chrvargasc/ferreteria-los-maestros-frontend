import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Checkout from "./Checkout";
import Confirmacion from "./Confirmacion";

const { estadoSesion, estadoCarrito, mockVaciarCarrito, productosCheckout } = vi.hoisted(() => ({
  estadoSesion: { usuario: null },
  estadoCarrito: { carrito: [] },
  mockVaciarCarrito: vi.fn(),
  productosCheckout: [
    {
      id: 2,
      codigo: "PT001",
      nombre: "Pintura látex interior 1 galón",
      categoria: "Pinturas",
      marca: "Sipa",
      unidad: "galón",
      precio: 9990,
      precioOferta: 8990,
      stock: 40,
      stockMinimo: 10,
      imagen: "/pintura.jpg",
    },
  ],
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: estadoSesion.usuario }),
}));

vi.mock("../context/ProductosContext", () => ({
  // recargarProductos es una función normal porque setup.js ejecuta vi.restoreAllMocks()
  useProductos: () => ({ productos: productosCheckout, recargarProductos: () => {} }),
}));

vi.mock("../context/CarritoContext", () => ({
  useCarrito: () => ({ carrito: estadoCarrito.carrito, vaciarCarrito: mockVaciarCarrito }),
}));

function prepararCliente() {
  estadoSesion.usuario = {
    id: 1,
    nombre: "Cliente Maestro",
    correo: "cliente@losmaestros.cl",
    telefono: "9 1234 5678",
    cuentaCorriente: true,
  };
  estadoCarrito.carrito = [{ codigo: "PT001", cantidad: 2 }];
}

function renderizarCheckout() {
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-exitosa" element={<Confirmacion />} />
      </Routes>
    </MemoryRouter>
  );
}

// Respuestas simuladas de la API (Guía 16): la boleta y su detalle calculados por el backend.
// Guía 17: el POST /boletas responde la boleta con sus "detalles" (GET /detalles es solo para personal)
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(cuerpo) };
}

const boletaApi = {
  id: 7, numero: "LM-12345678", fecha: "2026-11-20T12:00:00", nombreCliente: "Cliente Maestro",
  correoCliente: "cliente@losmaestros.cl", telefonoCliente: "9 1234 5678", entrega: "retiro",
  calle: null, numeroDireccion: null, comuna: null, indicaciones: null, formaPago: "cuenta-corriente",
  total: 17980, estado: "RECIBIDA", usuarioId: null,
  detalles: [
    { id: 1, cantidad: 2, precioUnitario: 8990, subtotal: 17980, producto: { id: 2, codigo: "PT001", nombre: "Pintura látex interior 1 galón" } },
  ],
};

// JWT de prueba que vence en 1 hora (el frontend solo lee "exp"; la firma la verifica el backend)
const tokenCliente = `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;

describe("Integrante 2 - Checkout y confirmación", () => {
  beforeEach(() => {
    mockVaciarCarrito.mockReset();
    prepararCliente();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("18. autocompleta los datos del cliente y exige dirección cuando selecciona despacho", async () => {
    const user = userEvent.setup();
    renderizarCheckout();

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue("Cliente Maestro");
    expect(screen.getByLabelText(/^correo$/i)).toHaveValue("cliente@losmaestros.cl");
    expect(screen.getByRole("option", { name: /cuenta corriente/i })).toBeInTheDocument();

    await user.click(screen.getByLabelText(/despacho a domicilio/i));
    await user.click(screen.getByRole("button", { name: /confirmar compra/i }));

    expect(screen.getByText("Ingresa la calle de entrega.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa el número de la dirección.")).toBeInTheDocument();
    expect(mockVaciarCarrito).not.toHaveBeenCalled();
  });

  it("19. calcula el total usando la oferta, registra la boleta en la API, vacía el carrito y muestra la confirmación", async () => {
    const user = userEvent.setup();
    const fetchSimulado = vi.fn().mockResolvedValueOnce(respuesta(201, boletaApi));
    vi.stubGlobal("fetch", fetchSimulado);
    renderizarCheckout();

    expect(screen.getAllByText("$17.980")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: /confirmar compra/i }));

    // La confirmación aparece después de la respuesta de la API
    expect(await screen.findByRole("heading", { name: /tu pedido fue recibido/i })).toBeInTheDocument();
    expect(mockVaciarCarrito).toHaveBeenCalledTimes(1);

    // POST /boletas: solo viajan productoId y cantidad. Guía 17: ya no se envía usuarioId,
    // el backend lo toma del token (esta prueba no tiene token: no viaja Authorization)
    const [url, opciones] = fetchSimulado.mock.calls[0];
    expect(url).toMatch(/\/boletas$/);
    expect(opciones.method).toBe("POST");
    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo).toEqual(expect.objectContaining({
      entrega: "retiro", formaPago: "cuenta-corriente", items: [{ productoId: 2, cantidad: 2 }],
    }));
    expect(cuerpo).not.toHaveProperty("usuarioId");
    expect(opciones.headers.Authorization).toBeUndefined();
    // Una sola llamada: la confirmación usa los detalles de la respuesta del POST (sin GET /detalles)
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
    expect(screen.getByText("LM-12345678")).toBeInTheDocument();
    expect(screen.getByText("Cuenta corriente")).toBeInTheDocument();

    const pedido = JSON.parse(localStorage.getItem("ferreteriaUltimoPedidoReact"));
    expect(pedido).toEqual(expect.objectContaining({ entrega: "retiro", formaPago: "cuenta-corriente", total: 17980 }));
    expect(pedido.items[0]).toEqual(expect.objectContaining({ codigo: "PT001", cantidad: 2, subtotal: 17980 }));
  });

  it("35. con sesión de cliente envía el Bearer y confirma la compra con la respuesta del POST, sin pedir los detalles", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("token", tokenCliente);
    const fetchSimulado = vi.fn().mockResolvedValueOnce(respuesta(201, { ...boletaApi, usuarioId: 1 }));
    vi.stubGlobal("fetch", fetchSimulado);
    renderizarCheckout();

    await user.click(screen.getByRole("button", { name: /confirmar compra/i }));

    expect(await screen.findByRole("heading", { name: /tu pedido fue recibido/i })).toBeInTheDocument();
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
    expect(fetchSimulado.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${tokenCliente}`);
    expect(screen.queryByText(/no tienes permisos/i)).not.toBeInTheDocument();
    expect(screen.getByText("LM-12345678")).toBeInTheDocument();
  });
});
