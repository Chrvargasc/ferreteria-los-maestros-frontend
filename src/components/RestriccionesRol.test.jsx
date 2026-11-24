import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Cabecera from "./Cabecera";
import RutaRol from "./RutaRol";
import RutaTienda from "./RutaTienda";

// Restricciones de vistas por rol (Guía 17 + Anexo 1):
// VENDEDOR solo ve productos y boletas; CLIENTE solo la tienda y su cuenta.
const { estadoSesion } = vi.hoisted(() => ({ estadoSesion: { usuario: null } }));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: estadoSesion.usuario, cerrarSesion: () => {} }),
}));

vi.mock("../context/CarritoContext", () => ({
  useCarrito: () => ({ cantidadTotal: 0 }),
}));

const PERSONAL = ["VENDEDOR", "ADMINISTRADOR"];

// Rutas mínimas con los mismos guardias de App.jsx
function renderizarEn(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route element={<RutaTienda />}>
          <Route path="/" element={<h1>INICIO TIENDA</h1>} />
          <Route path="/carrito" element={<h1>CARRITO</h1>} />
          <Route path="/ofertas" element={<h1>OFERTAS</h1>} />
          <Route path="/checkout" element={<h1>CHECKOUT</h1>} />
        </Route>
        <Route path="/vendedor" element={<RutaRol roles={PERSONAL}><h1>PANEL VENDEDOR</h1></RutaRol>} />
        <Route path="/boletas" element={<RutaRol roles={PERSONAL}><h1>BOLETAS</h1></RutaRol>} />
        <Route path="/admin" element={<RutaRol roles={["ADMINISTRADOR"]}><h1>ADMINISTRACIÓN</h1></RutaRol>} />
        <Route path="/mi-cuenta" element={<h1>CUENTA CLIENTE</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Integrante 3 - Restricciones por rol", () => {
  it("36. el vendedor no entra a las rutas de la tienda: vuelve a su panel", () => {
    estadoSesion.usuario = { rol: "VENDEDOR" };
    for (const ruta of ["/", "/carrito", "/ofertas", "/checkout"]) {
      const { unmount } = renderizarEn(ruta);
      expect(screen.getByRole("heading", { name: "PANEL VENDEDOR" })).toBeInTheDocument();
      unmount();
    }
  });

  it("37. el cliente usa la tienda, pero no entra a panel vendedor, boletas ni administración", () => {
    estadoSesion.usuario = { rol: "CLIENTE" };
    const { unmount } = renderizarEn("/carrito");
    expect(screen.getByRole("heading", { name: "CARRITO" })).toBeInTheDocument();
    unmount();

    for (const ruta of ["/vendedor", "/boletas", "/admin"]) {
      const { unmount: desmontar } = renderizarEn(ruta);
      expect(screen.getByRole("heading", { name: "CUENTA CLIENTE" })).toBeInTheDocument();
      desmontar();
    }
  });

  it("38. el menú del vendedor muestra solo Panel vendedor, Productos y Boletas", () => {
    estadoSesion.usuario = { rol: "VENDEDOR" };
    render(<MemoryRouter><Cabecera /></MemoryRouter>);

    const menu = within(screen.getByRole("navigation"));
    expect(menu.getByRole("link", { name: "Panel vendedor" })).toHaveAttribute("href", "/vendedor");
    expect(menu.getByRole("link", { name: "Productos" })).toHaveAttribute("href", "/inventario");
    expect(menu.getByRole("link", { name: "Boletas" })).toHaveAttribute("href", "/boletas");
    for (const oculto of [/^inicio$/i, /catálogo/i, /ofertas/i, /mi pedido/i]) {
      expect(menu.queryByRole("link", { name: oculto })).not.toBeInTheDocument();
    }

    // El cliente, en cambio, ve la tienda y no ve Boletas
    estadoSesion.usuario = { rol: "CLIENTE" };
    render(<MemoryRouter><Cabecera /></MemoryRouter>);
    const menuCliente = within(screen.getAllByRole("navigation")[1]);
    expect(menuCliente.getByRole("link", { name: /mi pedido/i })).toBeInTheDocument();
    expect(menuCliente.queryByRole("link", { name: "Boletas" })).not.toBeInTheDocument();
  });
});
