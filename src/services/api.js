import { renovar } from "./authService";
import {
  MENSAJE_SESION_EXPIRADA,
  avisarSesionExpirada,
  guardarToken,
  leerToken,
  minutosRestantes,
} from "./sesion";

// Dirección base de la API de la tienda (Guía 16). Se define en .env.development y la entrega Vite
export const API_URL = import.meta.env.VITE_API_URL;

// Si al token le quedan menos minutos que esto, se renueva antes de usarlo
const MINUTOS_PARA_RENOVAR = 10;

// Tratamiento común de las respuestas, igual al de la guía, compartido por todos los servicios.
// Si la API responde un error, se usa el mensaje { "error": "..." } del backend.
export async function procesarRespuesta(response) {
  if (!response.ok) {
    let mensaje = `La API respondió ${response.status}`;
    try {
      const cuerpo = await response.json();
      if (cuerpo.error) mensaje = cuerpo.error;
    } catch {
      // Respuesta sin cuerpo JSON: se mantiene el mensaje con el código
    }
    throw new Error(mensaje);
  }
  return response.status === 204 ? null : response.json();
}

// Si varias llamadas necesitan renovar al mismo tiempo, comparten una sola renovación
let renovacionEnCurso = null;

// Devuelve el token que se debe enviar (o null si no hay sesión).
// Renovación: si le quedan menos de 10 minutos, primero pide uno nuevo a Auth.
async function tokenVigente() {
  const token = leerToken();
  if (!token) return null;
  if (minutosRestantes(token) >= MINUTOS_PARA_RENOVAR) return token;

  if (!renovacionEnCurso) {
    renovacionEnCurso = renovar(token)
      .then((respuesta) => {
        guardarToken(respuesta.token);
        return respuesta.token;
      })
      .catch(() => {
        // Si Auth no responde pero el token aún no vence, se sigue usando; si ya venció, se cierra la sesión
        if (minutosRestantes(token) > 0) return token;
        avisarSesionExpirada();
        return null;
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

// Envía la solicitud agregando "Authorization: Bearer" cuando hay token (Guía 17)
async function enviarSolicitud(url, opciones, token) {
  const headers = { ...opciones.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(url, { ...opciones, headers });
  } catch {
    // Backend detenido o sin red: fetch lanza "Failed to fetch" en inglés
    throw new Error("No se pudo conectar con el servidor.");
  }
}

// Todas las llamadas a la API de la tienda pasan por aquí
export async function llamarApi(url, opciones = {}) {
  const token = await tokenVigente();
  const response = await enviarSolicitud(url, opciones, token);

  // 401 con token: el backend lo rechazó (alterado, vencido o firmado con otra clave)
  if (response.status === 401 && token) {
    avisarSesionExpirada();
    // Una lectura (catálogo, ofertas, detalle) se reintenta sin token: el usuario sigue en la tienda.
    // Una compra NO se reintenta: quedaría como invitado sin que el cliente lo sepa
    if ((opciones.method ?? "GET") === "GET") {
      return procesarRespuesta(await enviarSolicitud(url, opciones, null));
    }
    throw new Error(MENSAJE_SESION_EXPIRADA);
  }

  return procesarRespuesta(response);
}
