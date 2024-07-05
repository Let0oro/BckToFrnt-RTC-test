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
    const dataRes = await response.json();

    if (response.status >= 300) {
      alert(dataRes.message);
      return;
    }

    if (response.ok) {
      const {userName, _id, email} = dataRes.user;
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
