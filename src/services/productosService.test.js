import { afterEach, describe, expect, it, vi } from "vitest";
import {
  IMAGEN_POR_DEFECTO,
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "./productosService";

// Desde la Guía 16 el servicio usa la API. La prueba reemplaza fetch por una función simulada
// (vi.fn().mockResolvedValue, como en el proyecto de clases) para no depender del backend.
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(cuerpo) };
}

const productoApi = {
  id: 9, codigo: "ZZ001", nombre: "Producto persistente", marca: "Marca Test", unidad: "unidad",
  precio: 1000, precioOferta: null, stock: 5, stockMinimo: 2, imagen: null, descripcion: null,
  categoria: { id: 3, nombre: "Pruebas" },
};

const formulario = {
  codigo: " zz001 ", nombre: "Producto persistente", marca: "Marca Test", unidad: "unidad",
  precio: "1000", precioOferta: "", stock: "5", stockMinimo: "2", imagen: "", descripcion: "",
  categoriaId: "3",
};

describe("Integrante 3 - Servicio de productos con la API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("30. ejecuta el CRUD contra la API, adapta el producto y entrega el error del backend al rechazar un código duplicado", async () => {
    const fetchSimulado = vi.fn();
    vi.stubGlobal("fetch", fetchSimulado);

    // GET: la categoría llega como objeto y se adapta al formato de las páginas
    fetchSimulado.mockResolvedValueOnce(respuesta(200, [productoApi]));
    const lista = await listarProductos();
    expect(lista[0]).toEqual(expect.objectContaining({ id: 9, codigo: "ZZ001", categoria: "Pruebas", categoriaId: 3, precioOferta: undefined }));
    expect(lista[0].imagen).toBe(IMAGEN_POR_DEFECTO);

    // POST duplicado: el 409 se transforma en un Error con el mensaje del backend
    fetchSimulado.mockResolvedValueOnce(respuesta(409, { error: "Ya existe un producto con ese código: MC001" }));
    await expect(crearProducto({ ...formulario, codigo: "MC001" })).rejects.toThrow("Ya existe un producto con ese código: MC001");

    // POST correcto: los números viajan como números y la categoría como { id }
    fetchSimulado.mockResolvedValueOnce(respuesta(201, productoApi));
    const creado = await crearProducto(formulario);
    expect(creado.codigo).toBe("ZZ001");
    const [, opcionesPost] = fetchSimulado.mock.calls[2];
    expect(opcionesPost.method).toBe("POST");
    expect(JSON.parse(opcionesPost.body)).toEqual(expect.objectContaining({
      codigo: "ZZ001", precio: 1000, stock: 5, stockMinimo: 2, precioOferta: null, categoria: { id: 3 },
    }));

    // PUT usa el id en la URL; la imagen por defecto no se guarda en la base (viaja null)
    fetchSimulado.mockResolvedValueOnce(respuesta(200, { ...productoApi, precio: 1500 }));
    const actualizado = await actualizarProducto(9, { ...formulario, precio: "1500", imagen: IMAGEN_POR_DEFECTO });
    expect(JSON.parse(fetchSimulado.mock.calls[3][1].body).imagen).toBeNull();
    expect(actualizado.precio).toBe(1500);
    expect(fetchSimulado.mock.calls[3][0]).toMatch(/\/productos\/9$/);
    expect(fetchSimulado.mock.calls[3][1].method).toBe("PUT");

    // DELETE responde 204 sin cuerpo
    fetchSimulado.mockResolvedValueOnce(respuesta(204, null));
    await expect(eliminarProducto(9)).resolves.toBeNull();
    expect(fetchSimulado.mock.calls[4][1].method).toBe("DELETE");

    // Sin conexión, fetch lanza "Failed to fetch": el servicio entrega un mensaje en español
    fetchSimulado.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(listarProductos()).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});
