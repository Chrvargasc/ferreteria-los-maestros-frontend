// Roles tal como los entrega Auth en el usuario y en el token (Guía 17).
// En la EP2 eran "Cliente", "Empleado" y "Administrador"; "Empleado" pasó a llamarse Vendedor.
export const ROL_ADMINISTRADOR = "ADMINISTRADOR";
export const ROL_VENDEDOR = "VENDEDOR";
export const ROL_CLIENTE = "CLIENTE";

// Texto que se muestra en pantalla
export const NOMBRE_ROL = {
  [ROL_ADMINISTRADOR]: "Administrador",
  [ROL_VENDEDOR]: "Vendedor",
  [ROL_CLIENTE]: "Cliente",
};

// Panel al que llega cada rol después del login
export const PANEL_POR_ROL = {
  [ROL_ADMINISTRADOR]: "/admin",
  [ROL_VENDEDOR]: "/vendedor",
  [ROL_CLIENTE]: "/mi-cuenta",
};

export const NOMBRE_PANEL = {
  [ROL_ADMINISTRADOR]: "Administración",
  [ROL_VENDEDOR]: "Panel vendedor",
  [ROL_CLIENTE]: "Mi cuenta",
};
