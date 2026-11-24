import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProductosProvider } from "../context/ProductosContext";
import Inventario from "./Inventario";

// Desde la Guía 16 ProductosProvider pide los productos a la API: se simula el servicio
// con los mismos datos de la EP2 para no depender del backend.
vi.mock("../services/productosService", async () => {
  const { productos } = await import("../data/productos");
  // Función normal (no vi.fn) porque setup.js ejecuta vi.restoreAllMocks() después de cada prueba
  return { listarProductos: async () => productos.map((p) => ({ ...p })) };
});

describe("Integrante 3 - Inventario", () => {
  it("24. identifica stock bajo y permite filtrar el inventario", async () => {
    const user = userEvent.setup();

    // MemoryRouter: desde la Guía 17 cada fila enlaza al detalle del producto
    render(
      <MemoryRouter>
        <ProductosProvider>
          <Inventario />
        </ProductosProvider>
      </MemoryRouter>
    );

    // findAllByText espera a que termine la carga desde el servicio
    expect(await screen.findAllByText("Stock bajo")).toHaveLength(2);

    await user.type(screen.getByLabelText(/buscar por código, producto o categoría/i), "HE001");

    expect(screen.getByRole("status")).toHaveTextContent("Mostrando 1 producto(s).");
    expect(screen.getByRole("link", { name: "Taladro percutor 650 W" })).toHaveAttribute("href", "/producto/HE001");
    expect(screen.queryByText("Casco de seguridad blanco")).not.toBeInTheDocument();
  });
});
