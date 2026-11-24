# Ferretería Los Maestros - Frontend (EP2 + EP3)

Migración a React + Vite del proyecto desarrollado en la Evaluación Parcial 1 de DSY1104.
Desde la Evaluación Parcial 3 consume dos backend Spring Boot.

## EP3: integración con los backend (Guías 16 y 17)

| Servicio | URL (`.env.development`) | Uso |
|---|---|---|
| Auth (`ferreteria-los-maestros-auth`) | `VITE_AUTH_API_URL=http://localhost:8081/api/v1` | Login, registro y renovación del token (`services/authService.js`) |
| Tienda (`ferreteria-los-maestros-backend`) | `VITE_API_URL=http://localhost:8080/api/v1` | Productos, categorías y boletas (`services/api.js` y servicios) |

- **Sesión:** el login devuelve un JWT. El token y el usuario se guardan en `sessionStorage`
  (claves `token` y `usuario`): la sesión sobrevive a F5 y se borra al cerrar la pestaña o con
  "Cerrar sesión".
- **Token en las llamadas:** `services/api.js` agrega `Authorization: Bearer <token>`. Si al token
  le quedan menos de 10 minutos, primero lo renueva con `POST /auth/renovar`.
- **Token rechazado (401):** se cierra la sesión y aparece "Tu sesión expiró, inicia sesión
  nuevamente.". En la tienda la lectura se reintenta sin token; en una ruta protegida se va a
  `/login`; una compra no se reintenta (no queda como invitado sin que el cliente lo sepa).
- **Roles** (`utils/roles.js`, tal como los entrega Auth):

| Rol | Ve |
|---|---|
| Invitado | Tienda: inicio, catálogo, categorías, ofertas, detalle, carrito y checkout como invitado |
| `CLIENTE` | La tienda y Mi cuenta (`/mi-cuenta`, con sus compras reales de `GET /boletas/mias`) |
| `VENDEDOR` | Solo Panel vendedor (`/vendedor`), Productos (`/inventario` y detalle sin compra) y Boletas (`/boletas`) |
| `ADMINISTRADOR` | Todo: tienda, administración (`/admin`), inventario y boletas (puede anularlas) |

Las restricciones de pantalla son de navegación: la seguridad real está en los backend.

### Producción (Guía 18)

`npm run build` usa `.env.production`, con rutas relativas porque Nginx publica React y las dos
API en la misma dirección:

```text
VITE_AUTH_API_URL=/api/auth-service/v1     -> Auth   127.0.0.1:8081/api/v1
VITE_API_URL=/api/tienda-service/v1        -> Tienda 127.0.0.1:8080/api/v1
```

Como no llevan la IP, un cambio de IP de la EC2 no obliga a recompilar. `.env.production` se sube
al repositorio (solo trae rutas, sin secretos). Pasos completos en
`ferreteria-los-maestros-backend/deploy/DESPLIEGUE.md`.

## Estado actual

La base integra el trabajo funcional de los tres integrantes.

### Integrante 1 - Tienda pública y catálogo
- React + Vite.
- React Bootstrap.
- React Router.
- Inicio.
- Catálogo dinámico.
- Búsqueda y filtro por categoría.
- Vista Categorías.
- Detalle con ruta dinámica `/producto/:codigo`.
- Vista Ofertas.
- Diseño responsive.

### Integrante 2 - Clientes y checkout
- Registro con formulario controlado.
- Validación de RUT, correo, teléfono y contraseñas.
- Inicio de sesión.
- Persistencia con `localStorage` o `sessionStorage` según "Recuérdame".
- Panel protegido de cliente.
- Checkout con datos de contacto.
- Retiro en tienda o despacho.
- Dirección condicional para despacho.
- Forma de pago representada en frontend.
- Confirmación y resumen de compra.
- Vista de pago no procesado.

### Integrante 3 - Carrito y administración
- Carrito React mediante Context y `useState`.
- Persistencia automática del carrito con `useEffect` y `localStorage`.
- Sumar, restar, eliminar y vaciar productos.
- Validación contra stock disponible.
- Contador de unidades en la navegación.
- Inventario con búsqueda y alertas de stock bajo.
- Panel de empleado.
- Panel de administrador.
- Roles protegidos para Cliente, Empleado y Administrador.
- CRUD simulado de productos mediante archivo JavaScript y `localStorage`.
- Los cambios CRUD se reflejan en catálogo, ofertas, inventario y administración.

## Ejecutar

```bash
npm install
npm run dev
```

## Usuarios de prueba (solo desarrollo)

Los crea el backend Auth al arrancar (ver su README). No se muestran en la pantalla de login.

| Rol | Correo | Clave |
|---|---|---|
| CLIENTE | `cliente@losmaestros.cl` | `cliente123` |
| VENDEDOR | `vendedor@losmaestros.cl` | `vendedor123` |
| ADMINISTRADOR | `admin@losmaestros.cl` | `admin123` |

También se pueden crear clientes desde `/registro` (Auth siempre les asigna el rol `CLIENTE`).

> En la EP2 la autenticación y el CRUD eran simulaciones en el navegador. Desde la EP3 los hacen
> los backend; el carrito y el último pedido siguen en `localStorage`.

## Rutas principales

```text
/
/catalogo
/categorias
/ofertas
/producto/:codigo
/carrito
/login
/registro
/mi-cuenta
/checkout
/compra-exitosa
/pago-error
/vendedor
/inventario
/boletas
/admin
```

## Persistencia en el navegador

```text
localStorage:   ferreteriaCarritoReact, ferreteriaUltimoPedidoReact
sessionStorage: token, usuario   (sesión de la Guía 17)
```

## CRUD de productos

El archivo `src/services/productosService.js` implementa:

```text
obtenerProductos()
crearProducto()
actualizarProducto()
eliminarProducto()
restablecerProductos()
```

El administrador puede crear, editar y eliminar productos desde `/admin`. El catálogo inicial puede recuperarse con el botón `Restablecer`.

## Pruebas unitarias

El proyecto utiliza Vitest, jsdom, React Testing Library, jest-dom y user-event.

Comandos:

```bash
npm test
npm run test:watch
npm run coverage
```

La versión final mantiene **30 pruebas, 10 por integrante**, con casos de flujo e interacción ligados directamente al trabajo de cada integrante:

- **Integrante 1 (1-10):** ProductoCard, búsqueda y filtros del catálogo, navegación por categoría, ofertas, detalle de producto e Inicio.
- **Integrante 2 (11-20):** registro, login, persistencia de sesión, panel del cliente, checkout real y confirmación de compra.
- **Integrante 3 (21-30):** reglas y persistencia del carrito, página Carrito, inventario, protección por roles, panel empleado, CRUD del panel administrador y persistencia del catálogo.

El reporte HTML de cobertura se genera en `coverage/index.html`.

**EP3 (Guía 17):** 40 pruebas en 22 archivos. Se adaptaron las de login, sesión, registro, checkout,
detalle, inventario, roles y paneles (el login va contra Auth y los roles son `CLIENTE`, `VENDEDOR` y
`ADMINISTRADOR`), y se agregaron la 31 a la 40: renovación del token, manejo del 401, boletas por rol,
compra con sesión sin pedir `/detalles`, restricciones del vendedor y del cliente, y compras reales en
Mi cuenta.

> Resultado final validado: **19/19 archivos de prueba y 30/30 pruebas aprobadas**. Cobertura V8: **85.08% statements, 70.00% branches, 73.91% functions y 85.08% lines**. La cobertura de `src/pages` alcanza **95.28%** de statements/lines.

## Próxima etapa

1. Desplegar el build final en AWS EC2 con Nginx.
2. Registrar la IP o URL de despliegue y comprobar una ruta interna recargada directamente.
3. Preparar evidencias, GitHub y presentación individual.
4. Generar el ZIP final sin `node_modules` ni la carpeta `coverage`, salvo que el docente indique lo contrario.
