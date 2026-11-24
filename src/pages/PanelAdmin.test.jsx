import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PanelAdmin from "./PanelAdmin";

const {
  productosAdmin,
  mockCrear,
  mockActualizar,
  mockEliminar,
} = vi.hoisted(() => ({
  productosAdmin: [
    { id: 1, codigo: "MC001", nombre: "Cemento gris 25 kg", categoria: "Construcción", categoriaId: 1, marca: "Polpaico", unidad: "saco", precio: 5990, stock: 80, stockMinimo: 20, descripcion: "Cemento", imagen: "/cemento.jpg" },
    { id: 4, codigo: "HE001", nombre: "Taladro percutor 650 W", categoria: "Herramientas eléctricas", categoriaId: 5, marca: "Makita", unidad: "unidad", precio: 79990, stock: 2, stockMinimo: 3, descripcion: "Taladro", imagen: "/taladro.jpg" },
  ],
  mockCrear: vi.fn(),
  mockActualizar: vi.fn(),
  mockEliminar: vi.fn(),
}));

vi.mock("../context/SesionContext", () => ({
  useSesion: () => ({ usuario: { nombre: "Administrador Prueba", rol: "Administrador" } }),
}));

vi.mock("../context/ProductosContext", () => ({
  useProductos: () => ({
    productos: productosAdmin,
    crearProducto: mockCrear,
    actualizarProducto: mockActualizar,
    eliminarProducto: mockEliminar,
  }),
}));

// Desde la Guía 16 las categorías del formulario vienen de la API: se simula el servicio.
// Función normal (no vi.fn) porque setup.js ejecuta vi.restoreAllMocks() después de cada prueba.
vi.mock("../services/productosService", () => ({
  listarCategorias: async () => [
    { id: 1, nombre: "Construcción" },
    { id: 2, nombre: "Herramientas" },
    { id: 5, nombre: "Herramientas eléctricas" },
  ],
}));

function renderizarAdmin() {
  return render(
    <MemoryRouter>
      <PanelAdmin />
    </MemoryRouter>
  );
}

async function completarNuevoProducto(user) {
  await user.type(document.querySelector('input[name="codigo"]'), "ZZ001");
  await user.type(document.querySelector('input[name="nombre"]'), "Producto nuevo");
  // La categoría ahora es una lista con las categorías de la API
  await screen.findByRole("option", { name: "Herramientas" });
  await user.selectOptions(document.querySelector('select[name="categoriaId"]'), "2");
  await user.type(document.querySelector('input[name="marca"]'), "Marca Test");
  await user.type(document.querySelector('input[name="precio"]'), "12990");
  await user.type(document.querySelector('input[name="stock"]'), "10");
  await user.type(document.querySelector('input[name="stockMinimo"]'), "2");
}

describe("Integrante 3 - PanelAdmin", () => {
  beforeEach(() => {
    mockCrear.mockReset();
    mockActualizar.mockReset();
    mockEliminar.mockReset();
  });

  it("27. valida el formulario y crea un producto solo cuando los datos son correctos", async () => {
    const user = userEvent.setup();
    mockCrear.mockResolvedValue({ ok: true });
    renderizarAdmin();

    await user.click(screen.getByRole("button", { name: /nuevo producto/i }));
    await user.click(screen.getByRole("button", { name: /^guardar$/i }));
    expect(screen.getByText(/completa los campos obligatorios/i)).toBeInTheDocument();
    expect(mockCrear).not.toHaveBeenCalled();

    await completarNuevoProducto(user);
    await user.click(screen.getByRole("button", { name: /^guardar$/i }));

    expect(mockCrear).toHaveBeenCalledWith(expect.objectContaining({ codigo: "ZZ001", nombre: "Producto nuevo", categoriaId: "2", precio: "12990", stock: "10" }));
    expect(await screen.findByText("Producto creado correctamente.")).toBeInTheDocument();
  });

  it("28. carga un producto existente en el modal y envía sus cambios al actualizar", async () => {
    const user = userEvent.setup();
    mockActualizar.mockResolvedValue({ ok: true });
    renderizarAdmin();

    await user.click(screen.getAllByRole("button", { name: /^editar$/i })[0]);
    const precio = document.querySelector('input[name="precio"]');
    expect(document.querySelector('input[name="codigo"]')).toBeDisabled();
    expect(precio).toHaveValue(5990);
    expect(document.querySelector('select[name="categoriaId"]')).toHaveValue("1");

    await user.clear(precio);
    await user.type(precio, "6490");
    await user.click(screen.getByRole("button", { name: /^guardar$/i }));

    // PUT y DELETE usan el id del producto en la base (MC001 tiene id 1)
    expect(mockActualizar).toHaveBeenCalledWith(1, expect.objectContaining({ codigo: "MC001", precio: "6490" }));
    expect(await screen.findByText("Producto actualizado correctamente.")).toBeInTheDocument();
  });

  it("29. solicita confirmación antes de eliminar y elimina únicamente cuando el usuario acepta", async () => {
    const user = userEvent.setup();
    mockEliminar.mockResolvedValue({ ok: true });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderizarAdmin();

    const botonesEliminar = screen.getAllByRole("button", { name: /^eliminar$/i });
    await user.click(botonesEliminar[0]);
    expect(mockEliminar).not.toHaveBeenCalled();

    await user.click(botonesEliminar[0]);
    expect(confirmar).toHaveBeenCalledWith("¿Eliminar Cemento gris 25 kg?");
    expect(mockEliminar).toHaveBeenCalledWith(1);
    expect(await screen.findByText("Producto eliminado correctamente.")).toBeInTheDocument();
  });
});
