import { afterEach, describe, expect, it, vi } from "vitest";
import { llamarApi } from "./api";
import { EVENTO_SESION_EXPIRADA } from "./sesion";

// Guía 17: pruebas del token en las llamadas a la API, sin backend (fetch simulado)
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(cuerpo) };
}

// Arma un JWT de prueba con la expiración dentro de "minutos". La firma no importa:
// el frontend solo lee "exp"; la firma la verifica el backend
function tokenQueVenceEn(minutos) {
  const exp = Math.floor(Date.now() / 1000) + minutos * 60;
  return `cabecera.${btoa(JSON.stringify({ sub: "cliente@losmaestros.cl", exp }))}.firma`;
}

describe("Integrante 2 - Token en las llamadas a la API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("31. envía el Bearer y renueva el token cuando le quedan menos de 10 minutos", async () => {
    const tokenViejo = tokenQueVenceEn(5);
    const tokenNuevo = tokenQueVenceEn(60);
    sessionStorage.setItem("token", tokenViejo);
    const fetchSimulado = vi.fn()
      .mockResolvedValueOnce(respuesta(200, { token: tokenNuevo, usuario: {} })) // POST /auth/renovar
      .mockResolvedValueOnce(respuesta(200, [])); // GET /boletas
    vi.stubGlobal("fetch", fetchSimulado);

    await llamarApi("http://localhost:8080/api/v1/boletas");

    expect(fetchSimulado.mock.calls[0][0]).toMatch(/\/auth\/renovar$/);
    expect(fetchSimulado.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${tokenViejo}`);
    expect(fetchSimulado.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${tokenNuevo}`);
    expect(sessionStorage.getItem("token")).toBe(tokenNuevo);
  });

  it("32. ante un 401 en una lectura cierra la sesión, avisa y reintenta sin token", async () => {
    sessionStorage.setItem("token", tokenQueVenceEn(60));
    sessionStorage.setItem("usuario", JSON.stringify({ rol: "CLIENTE" }));
    const avisos = vi.fn();
    window.addEventListener(EVENTO_SESION_EXPIRADA, avisos);
    const fetchSimulado = vi.fn()
      .mockResolvedValueOnce(respuesta(401, { error: "Token inválido o expirado" }))
      .mockResolvedValueOnce(respuesta(200, [{ id: 1 }]));
    vi.stubGlobal("fetch", fetchSimulado);

    const productos = await llamarApi("http://localhost:8080/api/v1/productos");

    expect(productos).toEqual([{ id: 1 }]);
    expect(fetchSimulado.mock.calls[1][1].headers.Authorization).toBeUndefined();
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("usuario")).toBeNull();
    expect(avisos).toHaveBeenCalledTimes(1);
    window.removeEventListener(EVENTO_SESION_EXPIRADA, avisos);
  });

  it("33. ante un 401 en una compra no reintenta como invitado y avisa que la sesión expiró", async () => {
    sessionStorage.setItem("token", tokenQueVenceEn(60));
    const fetchSimulado = vi.fn().mockResolvedValueOnce(respuesta(401, { error: "Token inválido o expirado" }));
    vi.stubGlobal("fetch", fetchSimulado);

    await expect(llamarApi("http://localhost:8080/api/v1/boletas", { method: "POST", body: "{}" }))
      .rejects.toThrow("Tu sesión expiró, inicia sesión nuevamente.");
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
  });
});
