import Events from "./Events";
import Login, { loginSubmit } from "./Login";

const template = () => `
  <section id="register">
    <form>
      <input type="text" placeholder="Username" id="username"/>
      <input type="email" placeholder="Email" id="email"/>
      <input type="password" id="password" placeholder="Password" />
      <button id="registerbtn">Register</button>
    </form>
  </section>
`;

const registerSubmit = async () => {
  try {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const email = document.querySelector("#email").value;

    const response = await fetch("http://localhost:3000/api/v1/user/register", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        userName: username,
        email,
        password: password,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json.user)
      const {userName, _id, email} = json.user;
      // loginSubmit(username, password, email)
      Events({userName, _id, email});
    } else {
      const errorMessage = await response.json();
      console.error("Error:", errorMessage);
    }

  } catch (err) {
    console.error(new Error("Failed to register from app", err.message));
  }
};

const Register = () => {
  document.querySelector("main").innerHTML = template();

  document.querySelector("#registerbtn").addEventListener("click", () => {
    registerSubmit();
  });
};

export default Register;
