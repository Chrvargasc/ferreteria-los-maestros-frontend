import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PanelCliente from "./PanelCliente";

const { usuarioCliente, estadoCompras } = vi.hoisted(() => ({
  usuarioCliente: {
    nombre: "Cliente Maestro",
    correo: "cliente@losmaestros.cl",
    telefono: "9 1111 2222",
    rol: "CLIENTE",
    tipoCliente: "Contratista / Maestro de obra",
    cuentaCorriente: true,
  },
  estadoCompras: { lista: [] },
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: usuarioCliente }),
}));

// Guía 17: el historial viene de GET /boletas/mias (se simula el servicio)
vi.mock("../services/boletasService", () => ({
  listarMisBoletas: () => Promise.resolve(estadoCompras.lista),
}));

function renderizar() {
  return render(
    <MemoryRouter>
      <PanelCliente />
    </MemoryRouter>
  );
}

describe("Integrante 2 - PanelCliente", () => {
  beforeEach(() => {
    estadoCompras.lista = [];
  });

  it("17. presenta los datos reales de la sesión y el estado de cuenta corriente del cliente", async () => {
    renderizar();

    expect(screen.getByRole("heading", { name: "Hola, Cliente Maestro" })).toBeInTheDocument();
    expect(screen.getByText("Contratista / Maestro de obra")).toBeInTheDocument();
    expect(screen.getByText("Habilitada")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("cliente@losmaestros.cl")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir al catálogo/i })).toHaveAttribute("href", "/catalogo");
    expect(await screen.findByText("Aún no tienes compras.")).toBeInTheDocument();
  });

  it("40. muestra las compras reales del cliente y ya no los pedidos de ejemplo de la EP2", async () => {
    estadoCompras.lista = [
      { id: 2, numero: "LM-16045659", fecha: "2026-11-20T20:07:25", entrega: "retiro", estado: "RECIBIDA", total: 17980 },
    ];
    renderizar();

    expect(await screen.findByText("LM-16045659")).toBeInTheDocument();
    expect(screen.getByText("RECIBIDA")).toBeInTheDocument();
    expect(screen.getByText("$17.980")).toBeInTheDocument();
    expect(screen.queryByText("#1042")).not.toBeInTheDocument();
    expect(screen.queryByText("Aún no tienes compras.")).not.toBeInTheDocument();
  });
});
