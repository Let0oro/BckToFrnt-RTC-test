// Importa la función `Books` desde el módulo "./Books" para poder mostrarla
// una vez hayamos iniciado sesión
import Books from "./Books";

// Define una función arrow llamada `template` que devuelve un tempalte string
const template = () => `
  <section id="login">
    ${
      // Utiliza un ternario para mostrar un mensaje de bienvenida si ya hay un usuario en el localStorage,
      // de lo contrario, muestra un formulario de inicio de sesión
      localStorage.getItem("user")
        ? `<h2>You are already logged<h2>`
        : `<form>
          <input type="text" placeholder="Username" id="username"/>
          <input type="email" placeholder="Email" id="email"/>
          <input type="password" id="password" placeholder="Password" />
          <button id="loginbtn">Login</button>
        </form>`
    }
  </section>
`;

// Define una función asincrónica llamada `loginSubmit` para procesar el envío del formulario de inicio de sesión
const loginSubmit = async () => {
  // Obtiene los valores de nombre de usuario y contraseña desde los campos de entrada del formulario
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;
  const email = document.querySelector("#email").value;

  try {
    const data = await fetch("http://localhost:3000/api/v1/user/login", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        userName: username,
        email,
        password: password,
      }),
    });

    if (data.status >= 300) {
      alert("Invalid conection with server");
    }

    const dataRes = await data.json();
    const {userName, password: pass, _id, email: mail} = dataRes.user;

    localStorage.setItem("user", JSON.stringify({userName, password: pass, _id, email: mail}));

    alert(`Welcome ${username}`);

    Books();
  } catch (err) {
    console.error({message: "Error en login client-side", error: err.message});
  }
};

// Define una función llamada `Login` que actualiza el contenido de la sección de inicio de sesión en el DOM
const Login = () => {
  // Selecciona el elemento 'main' en el DOM y asigna el HTML generado por la función `template`
  document.querySelector("main").innerHTML = template();

  // Agrega un event listener al botón de inicio de sesión para procesar el evento de clic
  document.querySelector("#loginbtn")?.addEventListener("click", (ev) => {
    ev.preventDefault(); // Evita que el formulario recargue la página
    loginSubmit(); // Llama a la función `loginSubmit` para procesar el envío del formulario
  });
};

// Exporta la función `Login` como el valor predeterminado del módulo
export default Login;
