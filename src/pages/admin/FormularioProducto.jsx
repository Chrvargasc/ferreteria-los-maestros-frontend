import { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";

const inicial = {
  codigo: "",
  nombre: "",
  categoriaId: "",
  marca: "",
  unidad: "unidad",
  precio: "",
  precioOferta: "",
  stock: "",
  stockMinimo: "",
  descripcion: "",
  imagen: "",
};

function datosIniciales(producto) {
  if (!producto) return inicial;

  return {
    ...inicial,
    ...producto,
    precioOferta: producto.precioOferta ?? "",
    categoriaId: producto.categoriaId ?? "",
  };
}

// categorias llega por props desde PanelAdmin, que las carga desde la API
function FormularioProducto({ producto, categorias = [], onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(() => datosIniciales(producto));
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  // Guía 16: evita envíos dobles mientras se espera la respuesta de la API
  const [guardando, setGuardando] = useState(false);
  const editando = Boolean(producto);

  function cambiar(evento) {
    const { name, value } = evento.target;

    setDatos((actual) => ({
      ...actual,
      [name]: value,
    }));

    setErrores((actuales) => ({
      ...actuales,
      [name]: "",
    }));
    setErrorGeneral("");
  }

  async function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = {};

    if (!datos.codigo.trim()) nuevosErrores.codigo = "Código obligatorio";
    if (!datos.nombre.trim()) nuevosErrores.nombre = "Nombre obligatorio";
    if (!datos.categoriaId) nuevosErrores.categoriaId = "Categoría obligatoria";
    if (!datos.marca.trim()) nuevosErrores.marca = "Marca obligatoria";
    if (Number(datos.precio) <= 0) nuevosErrores.precio = "El precio debe ser mayor que cero";
    if (Number(datos.stock) < 0) nuevosErrores.stock = "El stock no puede ser negativo";
    if (Number(datos.stockMinimo) < 0) nuevosErrores.stockMinimo = "El stock mínimo no puede ser negativo";

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrorGeneral("Completa los campos obligatorios y utiliza valores numéricos válidos.");
      return;
    }

    // onGuardar llama a la API: si responde con error (por ejemplo 409 por código repetido)
    // se muestra el mensaje del backend y el formulario sigue abierto
    setGuardando(true);
    const resultado = await onGuardar(datos);
    setGuardando(false);

    if (resultado && !resultado.ok) {
      setErrorGeneral(resultado.mensaje);
    }
  }

  return (
    <Form onSubmit={enviar} noValidate>
      <Modal.Header closeButton>
        <Modal.Title>{editando ? "Editar producto" : "Nuevo producto"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}

        <Row className="g-3">
          <Col xs={12} md={4}>
            <Form.Group controlId="producto-codigo">
              <Form.Label>Código *</Form.Label>
              <Form.Control
                name="codigo"
                value={datos.codigo}
                onChange={cambiar}
                disabled={editando}
                isInvalid={Boolean(errores.codigo)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.codigo}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={8}>
            <Form.Group controlId="producto-nombre">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                name="nombre"
                value={datos.nombre}
                onChange={cambiar}
                isInvalid={Boolean(errores.nombre)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.nombre}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="producto-categoria">
              <Form.Label>Categoría *</Form.Label>
              <Form.Select
                name="categoriaId"
                value={datos.categoriaId}
                onChange={cambiar}
                isInvalid={Boolean(errores.categoriaId)}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => (
                  <option value={categoria.id} key={categoria.id}>{categoria.nombre}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errores.categoriaId}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="producto-marca">
              <Form.Label>Marca *</Form.Label>
              <Form.Control
                name="marca"
                value={datos.marca}
                onChange={cambiar}
                isInvalid={Boolean(errores.marca)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.marca}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group controlId="producto-unidad">
              <Form.Label>Unidad</Form.Label>
              <Form.Control name="unidad" value={datos.unidad} onChange={cambiar} />
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group controlId="producto-precio">
              <Form.Label>Precio *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="precio"
                value={datos.precio}
                onChange={cambiar}
                isInvalid={Boolean(errores.precio)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.precio}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group controlId="producto-precio-oferta">
              <Form.Label>Precio oferta</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="precioOferta"
                value={datos.precioOferta}
                onChange={cambiar}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="producto-stock">
              <Form.Label>Stock *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                name="stock"
                value={datos.stock}
                onChange={cambiar}
                isInvalid={Boolean(errores.stock)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.stock}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="producto-stock-minimo">
              <Form.Label>Stock mínimo *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                name="stockMinimo"
                value={datos.stockMinimo}
                onChange={cambiar}
                isInvalid={Boolean(errores.stockMinimo)}
              />
              <Form.Control.Feedback type="invalid">
                {errores.stockMinimo}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group controlId="producto-descripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={datos.descripcion}
                onChange={cambiar}
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" variant="warning" className="fw-semibold" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Form>
  );
}

export default FormularioProducto;
