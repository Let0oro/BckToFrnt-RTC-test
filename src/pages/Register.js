import { FrontFetch } from "#utils/Front.fetch";
import Events from "./Events";

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

    const dataRes = await FrontFetch.caller(
      { name: "user", method: "post", action: "register" },
      {
        userName: username,
        email,
        password: password,
      }
    );

    if (dataRes?.user) {
      const { userName, _id, email } = dataRes.user;
      Events({ userName, _id, email });
    } else {
      console.log("Error: " + dataRes);
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
