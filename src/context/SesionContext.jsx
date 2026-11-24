import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login, registrar } from "../services/authService";
import {
  EVENTO_SESION_EXPIRADA,
  MENSAJE_SESION_EXPIRADA,
  borrarSesion,
  guardarSesion,
  leerToken,
  leerUsuario,
  minutosRestantes,
} from "../services/sesion";
import { normalizarCorreo } from "../utils/validaciones";

const SesionContext = createContext(null);

// Guía 17: la sesión es el token emitido por Auth + los datos del usuario, en sessionStorage.
// Al recargar la página se leen de nuevo, así que la sesión se mantiene.
export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuario);
  // Mensaje "Tu sesión expiró..." que muestra Layout (en la tienda o en /login)
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    function alExpirar() {
      setUsuario(null);
      setAviso(MENSAJE_SESION_EXPIRADA);
    }

    // api.js dispara este evento cuando el backend rechaza el token
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);

    // Al abrir la página con un token ya vencido, la sesión se cierra de inmediato
    const token = leerToken();
    if (token && minutosRestantes(token) <= 0) {
      borrarSesion();
      alExpirar();
    }

    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  async function iniciarSesion(correo, clave) {
    try {
      const respuesta = await login({ correo, clave });
      guardarSesion(respuesta.token, respuesta.usuario);
      setUsuario(respuesta.usuario);
      setAviso("");
      return { ok: true, usuario: respuesta.usuario };
    } catch (e) {
      // Por ejemplo 401 "Credenciales inválidas" o Auth detenido
      return { ok: false, mensaje: e.message };
    }
  }

  // Registro contra Auth: crea siempre un CLIENTE. El usuario inicia sesión después
  async function registrarUsuario(datos) {
    try {
      await registrar({
        nombre: datos.nombre.trim(),
        rut: datos.rut.trim(),
        correo: normalizarCorreo(datos.correo),
        telefono: datos.telefono.trim(),
        tipoCliente: datos.tipoCliente,
        clave: datos.clave,
      });
      return { ok: true };
    } catch (e) {
      // Por ejemplo 409 "Ya existe una cuenta asociada a ese correo." o 400 de formato
      return { ok: false, mensaje: e.message };
    }
  }

  function cerrarSesion() {
    borrarSesion();
    setUsuario(null);
    setAviso("");
  }

  function limpiarAviso() {
    setAviso("");
  }

  const valor = useMemo(
    () => ({ usuario, aviso, iniciarSesion, registrarUsuario, cerrarSesion, limpiarAviso }),
    [usuario, aviso]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const contexto = useContext(SesionContext);

  if (!contexto) {
    throw new Error("useSesion debe utilizarse dentro de SesionProvider");
  }

  return contexto;
}
