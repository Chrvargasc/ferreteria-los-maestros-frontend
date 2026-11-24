import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../context/SesionContext";
import { PANEL_POR_ROL } from "../utils/roles";
import { normalizarCorreo, validarCorreo } from "../utils/validaciones";

function Login() {
  const { iniciarSesion } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const [formulario, setFormulario] = useState({ correo: "", clave: "" });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: "" }));
    setErrorGeneral("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    const nuevosErrores = {};

    if (!validarCorreo(formulario.correo)) {
      nuevosErrores.correo = "Ingresa un correo válido.";
    }

    if (!formulario.clave) {
      nuevosErrores.clave = "Ingresa tu contraseña.";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    // Guía 17: las credenciales se validan en Auth (8081), que devuelve el token
    setEnviando(true);
    const resultado = await iniciarSesion(normalizarCorreo(formulario.correo), formulario.clave);
    setEnviando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.mensaje);
      return;
    }

    navigate(location.state?.desde || PANEL_POR_ROL[resultado.usuario?.rol] || "/", { replace: true });
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={5}>
          <Card className="shadow-sm border-0 tarjeta-formulario">
            <Card.Body className="p-4 p-lg-5">
              <p className="etiqueta">Acceso al sistema</p>
              <h1 className="h2 mb-3">Iniciar sesión</h1>
              <p className="texto-suave">
                Ingresa según tu rol para acceder a las funciones de cliente, vendedor o administrador.
              </p>

              {location.state?.mensaje && <Alert variant="success">{location.state.mensaje}</Alert>}
              {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}

              <Form noValidate onSubmit={enviar}>
                <Form.Group className="mb-3" controlId="login-correo">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formulario.correo}
                    onChange={actualizarCampo}
                    isInvalid={Boolean(errores.correo)}
                    autoComplete="email"
                  />
                  <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="login-clave">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="clave"
                    value={formulario.clave}
                    onChange={actualizarCampo}
                    isInvalid={Boolean(errores.clave)}
                    autoComplete="current-password"
                  />
                  <Form.Control.Feedback type="invalid">{errores.clave}</Form.Control.Feedback>
                </Form.Group>

                {/* Sin "Recuérdame": la sesión vive en sessionStorage (Guía 17) y dura lo que la pestaña */}
                <Button type="submit" variant="warning" className="w-100 fw-semibold mt-2" disabled={enviando}>
                  {enviando ? "Ingresando..." : "Iniciar sesión"}
                </Button>
              </Form>

              <hr className="my-4" />
              {/* Las credenciales de prueba están solo en los README, no en la pantalla */}
              <p className="mb-0">
                ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
