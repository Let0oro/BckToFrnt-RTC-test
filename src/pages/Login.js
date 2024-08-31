import { FrontFetch } from "#utils/Front.fetch";
import Events from "./Events";

const template = () => {
  let cookieObj = document.cookie
    .replace("%40", "@")
    .split(";")
    .map((v) => v.split("=")[1]);
  const [email, name, password] = cookieObj;

  return `<section id="login">
  ${
    !!document.cookie.length
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
};

export const loginSubmit = async (
  userName = null,
  password = null,
  email = null
) => {
  userName = userName || document.querySelector("#username").value;
  password = password || document.querySelector("#password").value;
  email = email || document.querySelector("#email").value;

  try {
    const dataRes = FrontFetch.caller(
      { name: "user", method: "post", action: "login" },
      {
        userName,
        email,
        password,
      }
    );

    if (dataRes.user){
      alert(`Welcome ${userName}`);
      Events(dataRes.user);
    }
  } catch (err) {
    console.error({
      message: "Error en login client-side",
      error: err.message,
    });
  }
};

const Login = () => {
  document.querySelector("main").innerHTML = template();

  document.querySelector("#loginbtn")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    loginSubmit();
  });
};

export default Login;
