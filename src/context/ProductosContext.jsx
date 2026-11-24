import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  actualizarProducto as actualizarProductoServicio,
  crearProducto as crearProductoServicio,
  eliminarProducto as eliminarProductoServicio,
  listarProductos,
} from "../services/productosService";

const ProductosContext = createContext(null);

export function ProductosProvider({ children }) {
  // Estados de la Guía 16: datos, carga y error por separado
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarProductos() {
    try {
      setError("");
      setProductos(await listarProductos());
    } catch (e) {
      setError(`No se pudieron cargar los productos: ${e.message}`);
    } finally {
      setCargando(false);
    }
  }

  // Carga desde la API al montar la aplicación
  useEffect(() => {
    cargarProductos();
  }, []);

  // Las operaciones devuelven { ok, mensaje } para que el formulario muestre el error de la API
  async function crearProducto(datos) {
    try {
      const nuevo = await crearProductoServicio(datos);
      setProductos((actual) => [...actual, nuevo]);
      return { ok: true, producto: nuevo };
    } catch (e) {
      return { ok: false, mensaje: e.message };
    }
  }

  async function actualizarProducto(id, datos) {
    try {
      const actualizado = await actualizarProductoServicio(id, datos);
      setProductos((actual) => actual.map((p) => (p.id === id ? actualizado : p)));
      return { ok: true, producto: actualizado };
    } catch (e) {
      return { ok: false, mensaje: e.message };
    }
  }

  async function eliminarProducto(id) {
    try {
      await eliminarProductoServicio(id);
      setProductos((actual) => actual.filter((p) => p.id !== id));
      return { ok: true };
    } catch (e) {
      return { ok: false, mensaje: e.message };
    }
  }

  // Las rutas y el carrito siguen identificando el producto por su código
  function buscarProducto(codigo) {
    return productos.find((producto) => producto.codigo === codigo) ?? null;
  }

  const categorias = useMemo(
    () => [...new Set(productos.map((producto) => producto.categoria))].sort((a, b) => a.localeCompare(b, "es")),
    [productos]
  );

  const valor = useMemo(
    () => ({
      productos, categorias, cargando, error,
      buscarProducto, crearProducto, actualizarProducto, eliminarProducto, recargarProductos: cargarProductos,
    }),
    [productos, categorias, cargando, error]
  );

  return <ProductosContext.Provider value={valor}>{children}</ProductosContext.Provider>;
}

export function useProductos() {
  const contexto = useContext(ProductosContext);
  if (!contexto) throw new Error("useProductos debe utilizarse dentro de ProductosProvider");
  return contexto;
}
