# Ajustes de React siguiendo Guías 9–12 — Ferretería Los Maestros

Esta versión refactoriza la implementación para acercarla al patrón usado en las guías de DSY1104, sin cambiar el objetivo funcional del proyecto.

## Patrón principal tomado de las guías

Guía 9:
- componentes funcionales pequeños;
- `components/` para piezas reutilizables;
- página compuesta desde componentes;
- React Bootstrap para navegación y diseño.

Guía 10:
- datos separados de la presentación;
- componente tarjeta recibe datos por `props`;
- funciones/eventos también se pasan por `props`;
- una lista usa `map()` para crear varias tarjetas sin duplicar JSX;
- `useState` y `useEffect` para estado y persistencia.

Guía 11:
- `pages/` representa vistas asociadas a rutas;
- React Router en `App.jsx`;
- formularios controlados separados de la página administrativa;
- el formulario comunica el resultado al padre mediante una prop (`onGuardar`).

Guía 12:
- `Container`, `Row`, `Col` y breakpoints `xs`, `md`, `lg`;
- una tarjeta por objeto usando `map()`;
- revisión en 375, 768, 1024 y 1440 px.

## Cambios realizados

### Catálogo y Ofertas
Antes cada página hacía directamente el `map()` hacia `ProductoCard`.
Ahora ambas usan:

```jsx
<ListaProductos
  productos={productosFiltrados}
  onAgregar={agregarProducto}
/>
```

`ListaProductos` hace el `map()` y crea un `ProductoCard` por producto, igual al patrón `Cartelera -> TarjetaActividad` de la Guía 10.

`ProductoCard` recibe ahora tanto el objeto `producto` como la función `onAgregar` mediante props:

```jsx
function ProductoCard({ producto, onAgregar, mostrarAgregar = true })
```

Esto hace visible el flujo padre -> hijo enseñado en la guía.

### Inicio y Categorías
Se extrajeron tarjetas reutilizables:
- `CategoriaCard.jsx`
- `ProductoDestacadoCard.jsx`
- `TarjetaAyuda.jsx`

Las páginas conservan el arreglo y el `map()`, pero cada vuelta renderiza un componente con props en vez de repetir toda la tarjeta.

### Carrito
Se creó `ItemCarritoCard.jsx`.

La página mantiene el estado general y los cálculos, y cada producto recibe:

```jsx
<ItemCarritoCard
  item={item}
  onCambiarCantidad={cambiarCantidad}
  onEliminar={eliminarProducto}
/>
```

Esto sigue el patrón de la Guía 10: el padre entrega datos y callbacks al componente hijo.

### PanelEmpleado y PanelAdmin
Se creó `MetricaCard.jsx`, reutilizada por ambos paneles.

Ejemplo:

```jsx
<MetricaCard
  valor={stockBajo}
  titulo="Productos con stock bajo"
/>
```

Esto elimina la repetición de tarjetas casi idénticas y hace evidente la reutilización de componentes.

### Inventario
Se creó `FilaInventario.jsx`, que recibe un producto por props y decide visualmente si está disponible o con stock bajo.

### PanelAdmin y formulario
La Guía 11 separa `AdminActividades` de `FormularioActividad`. Se aplicó el mismo patrón:

- `PanelAdmin.jsx`: coordina la vista, productos y operaciones CRUD.
- `pages/admin/FormularioProducto.jsx`: mantiene el estado del formulario, valida y llama `onGuardar(datos)`.
- `ProductoAdminRow.jsx`: representa una fila y recibe callbacks `onEditar` y `onEliminar`.

La página administrativa deja de contener todo el formulario y todas las filas dentro del mismo JSX.

### Checkout
El antiguo `Checkout.jsx` contenía varias tarjetas y más de 300 líneas. Se dividió en:

- `CheckoutClienteCard.jsx`
- `CheckoutEntregaCard.jsx`
- `CheckoutPagoCard.jsx`
- `ResumenCheckoutCard.jsx`

`Checkout.jsx` conserva el estado y la lógica del pedido; los hijos reciben datos y eventos mediante props.

## Componentes reutilizables visibles después del ajuste

```text
src/components/
├── Cabecera.jsx
├── Layout.jsx
├── PiePagina.jsx
├── ProductoCard.jsx
├── ListaProductos.jsx
├── CategoriaCard.jsx
├── ProductoDestacadoCard.jsx
├── TarjetaAyuda.jsx
├── MetricaCard.jsx
├── ItemCarritoCard.jsx
├── FilaInventario.jsx
├── ProductoAdminRow.jsx
├── CheckoutClienteCard.jsx
├── CheckoutEntregaCard.jsx
├── CheckoutPagoCard.jsx
├── ResumenCheckoutCard.jsx
├── RutaCliente.jsx
└── RutaRol.jsx
```

## Ejemplo de defensa alineado con las guías

> En la Guía 10 se utiliza una Cartelera que recorre un arreglo y crea una TarjetaActividad por elemento. Nosotros aplicamos el mismo patrón con ListaProductos y ProductoCard. ListaProductos recibe el arreglo de productos y la función agregarProducto, realiza el map y entrega a cada ProductoCard el producto y el callback por props. Así, agregar un producto nuevo a los datos produce una nueva tarjeta sin copiar JSX.

> En la Guía 11 la página administrativa compone un FormularioActividad separado que recibe onGuardar. En nuestro proyecto PanelAdmin compone FormularioProducto, que mantiene su estado controlado, valida sus campos y entrega los datos al padre mediante onGuardar. De esta forma cada componente tiene una responsabilidad más clara.

## Validación técnica de esta copia

- Se revisó la sintaxis de todos los `.js` y `.jsx` con el parser de TypeScript: 0 errores de sintaxis.
- No se pudo ejecutar `npm install` en el entorno de generación por falta de acceso a las dependencias externas, por lo que las 30 pruebas y el build deben ejecutarse localmente después de `npm install`.
- La versión base utilizada para esta refactorización fue `Ferreteria_Los_Maestros_React_Testing_30_v5`.

## Ajuste v2 — Formulario administrativo siguiendo Guía 11

`FormularioProducto.jsx` se ajustó para seguir todavía más de cerca el patrón de `FormularioActividad.jsx` de la Guía 11:

- El formulario mantiene sus propios estados `datos` y `errores`.
- `cambiar(evento)` usa `evento.target`, `name` y `value` para actualizar distintos campos con un solo manejador.
- `enviar(evento)` usa `preventDefault()` y crea un objeto `nuevosErrores`.
- Se usa `Object.keys(nuevosErrores).length` para detener el guardado si existen errores.
- Los campos usan `isInvalid` y `Form.Control.Feedback`, tal como en la guía.
- La página `PanelAdmin.jsx` conserva la coordinación del CRUD y pasa `onGuardar` al formulario mediante props.
- Las funciones propias del formulario permanecen dentro del formulario; no se movieron artificialmente a `utils` o `services`.

Patrón resultante:

```text
PanelAdmin.jsx
   └─ <FormularioProducto onGuardar={guardarProducto} ... />
         ├─ useState(datos)
         ├─ useState(errores)
         ├─ cambiar(evento)
         ├─ enviar(evento)
         └─ onGuardar(datos)
```

Esto replica el patrón pedagógico de la Guía 11: página padre que coordina + formulario hijo controlado que valida y comunica datos por props.
