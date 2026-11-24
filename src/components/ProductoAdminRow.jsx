import { Badge, Button } from "react-bootstrap";

function ProductoAdminRow({ producto, onEditar, onEliminar }) {
  const bajo = producto.stock <= producto.stockMinimo;

  return (
    <tr>
      <th>{producto.codigo}</th>
      <td>
        {producto.nombre}
        <div className="small texto-suave">{producto.categoria}</div>
      </td>
      <td>{producto.stock}</td>
      <td>
        <Badge bg={bajo ? "warning" : "success"} text={bajo ? "dark" : undefined}>
          {bajo ? "Stock bajo" : "Disponible"}
        </Badge>
      </td>
      <td>
        <div className="d-flex flex-wrap gap-2">
          <Button size="sm" variant="outline-primary" onClick={() => onEditar(producto)}>Editar</Button>
          <Button size="sm" variant="outline-danger" onClick={() => onEliminar(producto)}>Eliminar</Button>
        </div>
      </td>
    </tr>
  );
}

export default ProductoAdminRow;
