import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import CategoriaCard from "../components/CategoriaCard";
import ProductoDestacadoCard from "../components/ProductoDestacadoCard";
import TarjetaAyuda from "../components/TarjetaAyuda";
import { useProductos } from "../context/ProductosContext";

function Inicio() {
  const { categorias, productos } = useProductos();
  const destacados = [productos[0], productos[4], productos[2]].filter(Boolean);

  const ayudas = [
    { titulo: "Llámanos", texto: "Confirma stock, medidas o disponibilidad antes de venir." },
    { titulo: "Haz tu consulta", texto: "Cuéntanos qué producto necesitas y te orientamos." },
    { titulo: "Visítanos", texto: "Atención directa en Avenida Balmaceda 2100, La Serena." },
  ];

  return (
    <>
      <section className="hero-react">
        <Container>
          <Row className="align-items-center g-4 py-5">
            <Col xs={12} lg={6}>
              <p className="etiqueta">Materiales y herramientas</p>
              <h1 className="display-5 fw-bold">Todo para hacer bien el trabajo</h1>
              <p className="lead">
                Consulta productos, precios y stock antes de venir a la ferretería. Una experiencia
                simple pensada para maestros, contratistas y clientes particulares.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/catalogo" variant="warning" size="lg" className="fw-semibold">
                  Ver productos
                </Button>
                <Button href="#ubicacion" variant="outline-light" size="lg">
                  Ver ubicación
                </Button>
              </div>
            </Col>
            <Col xs={12} lg={6}>
              <img
                src="/assets/img/portada-herramientas.jpg"
                alt="Caja de herramientas con llaves, dados y destornilladores"
                className="img-fluid rounded-4 shadow hero-imagen"
              />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 seccion-categorias-inicio">
        <Container>
          <p className="etiqueta">Comprar por categoría</p>
          <h2 className="mb-4">Encuentra más rápido lo que necesitas</h2>
          <Row className="g-3">
            {categorias.map((categoria) => {
              const cantidad = productos.filter((producto) => producto.categoria === categoria).length;
              return (
                <Col xs={12} sm={6} lg={3} key={categoria}>
                  <CategoriaCard
                    categoria={categoria}
                    cantidad={cantidad}
                    textoBoton="Ver en catálogo"
                    variante="outline-dark"
                    comoBoton
                  />
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <p className="etiqueta">Productos destacados</p>
          <h2 className="mb-4">Productos destacados</h2>
          <Row className="g-4">
            {destacados.map((producto) => (
              <Col xs={12} md={6} lg={4} key={producto.codigo}>
                <ProductoDestacadoCard producto={producto} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="seccion-suave py-5">
        <Container>
          <p className="etiqueta">¿Necesitas ayuda?</p>
          <h2 className="mb-4">Contáctanos si tienes dudas</h2>
          <Row className="g-4">
            {ayudas.map((ayuda) => (
              <Col xs={12} md={4} key={ayuda.titulo}>
                <TarjetaAyuda titulo={ayuda.titulo} texto={ayuda.texto} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section id="ubicacion" className="py-5">
        <Container>
          <p className="etiqueta">Información útil</p>
          <h2 className="mb-4">Ubicación y seguridad</h2>
          <Row className="g-4">
            <Col xs={12} lg={6}>
              <div className="h-100 p-4 border rounded-4">
                <h3 className="h4">Ubicación de la ferretería</h3>
                <img
                  src="/assets/img/mapa-ferreteria-googlemaps.png"
                  alt="Mapa con la ubicación de la ferretería en Avenida Balmaceda, La Serena"
                  className="img-fluid rounded-3 mb-3 mapa-imagen-react"
                />
                <p className="texto-suave">Avenida Balmaceda 2100, La Serena.</p>
                <a
                  href="https://www.google.com/maps?q=Avenida+Balmaceda+2100,+La+Serena,+Chile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver ubicación en Google Maps
                </a>
              </div>
            </Col>
            <Col xs={12} lg={6}>
              <div className="h-100 p-4 border rounded-4">
                <h3 className="h4">Seguridad en el trabajo</h3>
                <video className="w-100 rounded-3 mb-3" controls preload="metadata">
                  <source src="/assets/video/seguridad-herramientas-manuales.mp4" type="video/mp4" />
                  Tu navegador no permite reproducir el video.
                </video>
                <p className="texto-suave mb-0">
                  Recomendaciones de prevención de riesgos en el manejo de herramientas manuales.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

export default Inicio;
