import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SesionProvider, useSesion } from "./SesionContext";

function ComponentePruebaSesion() {
  const { usuario, iniciarSesion, cerrarSesion } = useSesion();

  return (
    <div>
      <button type="button" onClick={() => iniciarSesion("cliente@losmaestros.cl", "cliente123")}>
        Iniciar sesión
      </button>
      <button type="button" onClick={cerrarSesion}>Cerrar sesión</button>
      <span data-testid="rol-usuario">{usuario?.rol ?? "Sin sesión"}</span>
    </div>
  );
}

function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(cuerpo) };
}

const usuarioApi = { id: 1, nombre: "Cliente Demo", correo: "cliente@losmaestros.cl", rol: "CLIENTE" };
// JWT de prueba que vence en 1 hora (el Provider descarta al iniciar los tokens ya vencidos)
const tokenApi = `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;

describe("Integrante 2 - SesionContext", () => {
  afterEach(() => vi.unstubAllGlobals());

  // Guía 17 (adaptada): antes probaba "Recuérdame" con localStorage; ahora la sesión es el JWT de Auth
  it("16. inicia sesión contra Auth, guarda token y usuario en sessionStorage, sobrevive a una recarga y se cierra", async () => {
    const user = userEvent.setup();
    const fetchSimulado = vi.fn().mockResolvedValueOnce(respuesta(200, { token: tokenApi, usuario: usuarioApi }));
    vi.stubGlobal("fetch", fetchSimulado);

    const { unmount } = render(
      <SesionProvider>
        <ComponentePruebaSesion />
      </SesionProvider>
    );

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    expect(await screen.findByText("CLIENTE")).toBeInTheDocument();
    expect(fetchSimulado.mock.calls[0][0]).toMatch(/\/auth\/login$/);
    expect(JSON.parse(fetchSimulado.mock.calls[0][1].body)).toEqual({ correo: "cliente@losmaestros.cl", clave: "cliente123" });
    expect(sessionStorage.getItem("token")).toBe(tokenApi);
    expect(sessionStorage.getItem("usuario")).toContain("cliente@losmaestros.cl");
    expect(localStorage.getItem("token")).toBeNull();

    // "Recarga": un Provider nuevo lee la sesión guardada
    unmount();
    render(
      <SesionProvider>
        <ComponentePruebaSesion />
      </SesionProvider>
    );
    expect(screen.getByTestId("rol-usuario")).toHaveTextContent("CLIENTE");

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    expect(screen.getByTestId("rol-usuario")).toHaveTextContent("Sin sesión");
    expect(sessionStorage.getItem("token")).toBeNull();
  });
});
