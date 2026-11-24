// Guía 17: servicio que solo conoce el backend Auth (VITE_AUTH_API_URL, puerto 8081).
// No usa llamarApi de api.js: login y registro no llevan token, y renovar recibe el suyo.
const AUTH_URL = import.meta.env.VITE_AUTH_API_URL;

async function enviar(ruta, opciones) {
  let response;
  try {
    response = await fetch(`${AUTH_URL}${ruta}`, opciones);
  } catch {
    throw new Error("No se pudo conectar con el servidor de autenticación.");
  }
  // Auth responde los errores como { "error": "mensaje" }
  const cuerpo = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(cuerpo?.error ?? `El servidor respondió ${response.status}`);
  }
  return cuerpo;
}

// Devuelve { token, usuario }. Con credenciales incorrectas Auth responde 401 "Credenciales inválidas"
export function login(credenciales) {
  return enviar("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  });
}

// Crea una cuenta de cliente (Auth siempre asigna el rol CLIENTE)
export function registrar(datos) {
  return enviar("/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

// Entrega un token nuevo a cambio de uno todavía vigente
export function renovar(token) {
  return enviar("/auth/renovar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
