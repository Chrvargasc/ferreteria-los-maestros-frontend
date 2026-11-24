import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Boletas from "./Boletas";

const { estadoSesion, boletasPrueba, detallesPrueba } = vi.hoisted(() => ({
  estadoSesion: { usuario: { nombre: "Vendedor Prueba", rol: "VENDEDOR" } },
  boletasPrueba: [
    { id: 4, numero: "LM-4", fecha: "2026-11-20T12:00:00", nombreCliente: "Cliente Demo", correoCliente: "cliente@losmaestros.cl",
      telefonoCliente: "912345678", entrega: "retiro", formaPago: "transferencia", total: 17980, estado: "RECIBIDA", usuarioId: 1 },
  ],
  detallesPrueba: [
    { id: 9, cantidad: 2, precioUnitario: 8990, subtotal: 17980, producto: { codigo: "PT001", nombre: "Pintura látex" } },
  ],
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: estadoSesion.usuario }),
}));

vi.mock("../context/ProductosContext", () => ({
  useProductos: () => ({ recargarProductos: () => {} }),
}));

vi.mock("../services/boletasService", () => ({
  listarBoletas: () => Promise.resolve(boletasPrueba),
  listarDetallesBoleta: () => Promise.resolve(detallesPrueba),
  anularBoleta: () => Promise.resolve(null),
}));

describe("Integrante 3 - Boletas por rol", () => {
  it("34. el vendedor ve las boletas con su detalle pero no puede anular; el administrador sí", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Boletas />);

    expect(await screen.findByText("LM-4")).toBeInTheDocument();
    expect(screen.getByText("Cliente #1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /anular/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ver detalle/i }));
    expect(await screen.findByText("Pintura látex")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /detalle de la boleta lm-4/i })).toBeInTheDocument();

    unmount();
    estadoSesion.usuario = { nombre: "Admin Prueba", rol: "ADMINISTRADOR" };
    render(<Boletas />);
    expect(await screen.findByRole("button", { name: /anular/i })).toBeInTheDocument();
  });
});
