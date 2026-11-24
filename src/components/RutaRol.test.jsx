import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import RutaRol from "./RutaRol";

const { estadoSesion } = vi.hoisted(() => ({
  estadoSesion: { usuario: { rol: "CLIENTE" } },
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: estadoSesion.usuario }),
}));

describe("Integrante 3 - Protección por roles", () => {
  it("25. impide que un cliente acceda a administración y lo devuelve a su panel", () => {
    // Guía 17: el rol llega desde Auth en mayúsculas
    estadoSesion.usuario = { rol: "CLIENTE" };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RutaRol roles={["ADMINISTRADOR"]}>
                <h1>ADMINISTRACIÓN PRIVADA</h1>
              </RutaRol>
            }
          />
          <Route path="/mi-cuenta" element={<h1>CUENTA CLIENTE</h1>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "CUENTA CLIENTE" })).toBeInTheDocument();
    expect(screen.queryByText("ADMINISTRACIÓN PRIVADA")).not.toBeInTheDocument();
  });
});
