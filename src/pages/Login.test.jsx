import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const { mockIniciarSesion } = vi.hoisted(() => ({
  mockIniciarSesion: vi.fn(),
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ iniciarSesion: mockIniciarSesion }),
}));

function renderizarLogin(rutaInicial = "/login") {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mi-cuenta" element={<h1>PANEL CLIENTE PRUEBA</h1>} />
        <Route path="/checkout" element={<h1>CHECKOUT DESTINO</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Integrante 2 - Login", () => {
  beforeEach(() => mockIniciarSesion.mockReset());

  it("14. bloquea credenciales inválidas y muestra el error entregado por la sesión", async () => {
    const user = userEvent.setup();
    mockIniciarSesion.mockResolvedValue({ ok: false, mensaje: "Correo o contraseña incorrectos." });
    renderizarLogin();

    await user.type(screen.getByLabelText(/^correo$/i), "cliente@losmaestros.cl");
    await user.type(screen.getByLabelText(/contraseña/i), "incorrecta");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    // Guía 17: ya no existe "Recuérdame"; la sesión vive en sessionStorage
    expect(mockIniciarSesion).toHaveBeenCalledWith("cliente@losmaestros.cl", "incorrecta");
    expect(await screen.findByText("Correo o contraseña incorrectos.")).toBeInTheDocument();
  });

  it("15. autentica al cliente y respeta la ruta desde la que fue enviado al login", async () => {
    const user = userEvent.setup();
    mockIniciarSesion.mockResolvedValue({ ok: true, usuario: { rol: "CLIENTE" } });

    render(
      <MemoryRouter initialEntries={[{ pathname: "/login", state: { desde: "/checkout" } }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<h1>CHECKOUT DESTINO</h1>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/^correo$/i), "CLIENTE@LOSMAESTROS.CL");
    await user.type(screen.getByLabelText(/contraseña/i), "cliente123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(mockIniciarSesion).toHaveBeenCalledWith("cliente@losmaestros.cl", "cliente123");
    expect(await screen.findByRole("heading", { name: "CHECKOUT DESTINO" })).toBeInTheDocument();
  });
});
