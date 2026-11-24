import { API_URL, llamarApi } from "./api";

const URL_PRODUCTOS = `${API_URL}/productos`;
const URL_CATEGORIAS = `${API_URL}/categorias`;

// Imagen genérica (SVG propio en public/) para productos sin foto
export const IMAGEN_POR_DEFECTO = "/assets/img/productos/sin-foto.svg";
const DESCRIPCION_POR_DEFECTO = "Producto disponible en Ferretería Los Maestros.";

// Convierte un producto de la API al formato que ya usan las páginas de la EP2.
// La única diferencia real es la categoría: la API la entrega como objeto { id, nombre }.
export function aFormatoTienda(producto) {
  return {
    id: producto.id,
    codigo: producto.codigo,
    nombre: producto.nombre,
    marca: producto.marca,
    unidad: producto.unidad,
    precio: producto.precio,
    // La API envía null cuando no hay oferta; en la EP2 el campo simplemente no existía
    precioOferta: producto.precioOferta ?? undefined,
    stock: producto.stock,
    stockMinimo: producto.stockMinimo,
    imagen: producto.imagen || IMAGEN_POR_DEFECTO,
    descripcion: producto.descripcion || DESCRIPCION_POR_DEFECTO,
    categoria: producto.categoria?.nombre ?? "",
    categoriaId: producto.categoria?.id ?? null,
  };
}

// Convierte los datos del formulario al JSON que espera el backend.
// Los inputs entregan texto: los números se convierten con Number (Guía 16).
export function aFormatoApi(datos) {
  return {
    codigo: datos.codigo.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    marca: datos.marca.trim(),
    unidad: datos.unidad.trim(),
    precio: Number(datos.precio),
    precioOferta: datos.precioOferta === "" || datos.precioOferta == null ? null : Number(datos.precioOferta),
    stock: Number(datos.stock),
    stockMinimo: Number(datos.stockMinimo),
    // La imagen por defecto es solo visual: a la base se envía null para que siga "sin imagen"
    imagen: datos.imagen?.trim() && datos.imagen.trim() !== IMAGEN_POR_DEFECTO ? datos.imagen.trim() : null,
    descripcion: datos.descripcion?.trim() || null,
    // El backend solo necesita el id de la categoría
    categoria: { id: Number(datos.categoriaId) },
  };
}

export async function listarProductos() {
  const productos = await llamarApi(URL_PRODUCTOS);
  return productos.map(aFormatoTienda);
}

export async function crearProducto(datos) {
  const creado = await llamarApi(URL_PRODUCTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aFormatoApi(datos)),
  });
  return aFormatoTienda(creado);
}

export async function actualizarProducto(id, datos) {
  const actualizado = await llamarApi(`${URL_PRODUCTOS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aFormatoApi(datos)),
  });
  return aFormatoTienda(actualizado);
}

export async function eliminarProducto(id) {
  return llamarApi(`${URL_PRODUCTOS}/${id}`, { method: "DELETE" });
}

export async function listarCategorias() {
  return llamarApi(URL_CATEGORIAS);
}
