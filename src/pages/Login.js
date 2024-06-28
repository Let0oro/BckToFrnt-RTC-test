import Events from "./Events";

const template = () => `
  <section id="login">
    ${
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

export const loginSubmit = async (username = null, password = null, email = null) => {
  console.log('LOGINSUBMIT', username, password, email)
  username = username || document.querySelector("#username").value;
  password = password || document.querySelector("#password").value;
  email = email || document.querySelector("#email").value;

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
        password,
      }),
    });

    if (data.status >= 300) {
      alert("Invalid conection with server");
    }

    const dataRes = await data.json();
    alert(`Welcome ${username}`);

    Events(dataRes.user);
  } catch (err) {
    console.error({message: "Error en login client-side", error: err.message});
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
