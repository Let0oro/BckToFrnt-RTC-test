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
      : `<form class="log_sign">
      <div>
        <input type="text" minlength="4" maxlength="30" placeholder="Username (4 - 30 char)" id="username"/>
        <p class="error" id="username_error">Your name must have 4 - 30 letters</p>
      </div>
      <div>
        <input type="email" placeholder="Email (e.g. user@example.com)" id="email" pattern="\\w+@\\w+\\.\\w{2,}" id="email"/>
        <p class="error" id="email_error">Please enter a valid email address, e.g. user@example.com</p>
      </div>
      <div>
        <input type="password" id="password" placeholder="Password" 
        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,24}" />
        <p class="error" id="password_error"
        >Password must contain at least one number,  lowercase,  uppercase and special character</p>
      </div>
    <button id="loginbtn">Login</button>
    </form>`
  }
    <p class="error" id="asyncErrorReg"></p>
    </section>
    `;
};

const showErrors = (err) => {
  const asyncErrorP = document.querySelector("#asyncErrorReg");

  asyncErrorP.style.display = "block";
  asyncErrorP.innerText = err;
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
    const {data, response} = await FrontFetch.caller(
      { name: "user", method: "post", action: "login" },
      {
        userName,
        email,
        password,
      }
    );

    if (data.user) {
      Events(data.user);
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
  console.clear();

  document.querySelector("#loginbtn")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    loginSubmit();
  });
};

export default Login;
