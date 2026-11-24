// Guía 17: el token y el usuario se guardan en sessionStorage, con las claves de la guía.
// Sobreviven a una recarga de la página y se borran al cerrar la pestaña.
const CLAVE_TOKEN = "token";
const CLAVE_USUARIO = "usuario";

// Evento del navegador que avisa a SesionContext que la sesión ya no sirve
export const EVENTO_SESION_EXPIRADA = "sesion-expirada";
export const MENSAJE_SESION_EXPIRADA = "Tu sesión expiró, inicia sesión nuevamente.";

export function leerToken() {
  return sessionStorage.getItem(CLAVE_TOKEN);
}

export function leerUsuario() {
  try {
    const texto = sessionStorage.getItem(CLAVE_USUARIO);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(token, usuario) {
  sessionStorage.setItem(CLAVE_TOKEN, token);
  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

// La renovación solo cambia el token; el usuario sigue siendo el mismo
export function guardarToken(token) {
  sessionStorage.setItem(CLAVE_TOKEN, token);
}

export function borrarSesion() {
  sessionStorage.removeItem(CLAVE_TOKEN);
  sessionStorage.removeItem(CLAVE_USUARIO);
}

// El JWT no está cifrado (Guía 17): su parte central (payload) es JSON en Base64URL.
// Se lee "exp" (segundos desde 1970) para saber cuántos minutos le quedan.
export function minutosRestantes(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return (exp * 1000 - Date.now()) / 60000;
  } catch {
    return 0;
  }
}

// Borra la sesión y avisa a SesionContext, que muestra el mensaje y saca al usuario de las rutas protegidas
export function avisarSesionExpirada() {
  borrarSesion();
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
}
