import { Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

function FilaInventario({ producto }) {
  const bajo = producto.stock <= producto.stockMinimo;

  return (
    <tr>
      <th scope="row">{producto.codigo}</th>
      {/* Enlace al detalle: así el vendedor ve la lista y el detalle de cada producto */}
      <td><Link to={`/producto/${producto.codigo}`}>{producto.nombre}</Link></td>
      <td>{producto.categoria}</td>
      <td>{producto.stock}</td>
      <td>{producto.stockMinimo}</td>
      <td>
        <Badge bg={bajo ? "warning" : "success"} text={bajo ? "dark" : undefined}>
          {bajo ? "Stock bajo" : "Disponible"}
        </Badge>
      </td>
    </tr>
  );
}

export default FilaInventario;
