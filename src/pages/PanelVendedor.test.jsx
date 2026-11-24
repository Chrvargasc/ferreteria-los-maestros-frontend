import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PanelVendedor from "./PanelVendedor";

const { productosPrueba, boletasPrueba } = vi.hoisted(() => ({
  productosPrueba: [
    { codigo: "HE001", stock: 2, stockMinimo: 3 },
    { codigo: "SE001", stock: 4, stockMinimo: 5 },
    { codigo: "MC001", stock: 80, stockMinimo: 20 },
  ],
  boletasPrueba: [
    { id: 1, numero: "LM-1", fecha: "2026-01-01T10:00:00", nombreCliente: "Constructora Norte", entrega: "retiro", total: 5990, estado: "RECIBIDA" },
    { id: 2, numero: "LM-2", fecha: "2026-01-02T10:00:00", nombreCliente: "Cliente particular", entrega: "despacho", total: 8990, estado: "ENTREGADA" },
  ],
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: { nombre: "Vendedor Prueba", rol: "VENDEDOR" } }),
}));

vi.mock("../context/ProductosContext", () => ({
  useProductos: () => ({ productos: productosPrueba }),
}));

// Guía 17: las boletas vienen de la API (GET /boletas con el token del vendedor)
vi.mock("../services/boletasService", () => ({
  listarBoletas: () => Promise.resolve(boletasPrueba),
}));

describe("Integrante 3 - PanelVendedor", () => {
  // Antes PanelEmpleado con pedidos de ejemplo; ahora las boletas son reales y el rol es Vendedor
  it("26. calcula las alertas de inventario, muestra las boletas de la API y da acceso a inventario y boletas", async () => {
    render(
      <MemoryRouter>
        <PanelVendedor />
      </MemoryRouter>
    );

    expect(screen.getByText(/hola, vendedor prueba/i)).toBeInTheDocument();
    expect(await screen.findByText("Constructora Norte")).toBeInTheDocument();
    const tarjetaStock = screen.getByText("Productos con stock bajo").closest(".card-body");
    expect(within(tarjetaStock).getByText("2")).toBeInTheDocument();
    const tarjetaPendientes = screen.getByText("Boletas por confirmar").closest(".card-body");
    expect(within(tarjetaPendientes).getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /revisar inventario/i })).toHaveAttribute("href", "/inventario");
    expect(screen.getByRole("button", { name: /ver todas las boletas/i })).toHaveAttribute("href", "/boletas");
  });
});
