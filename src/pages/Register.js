import { FrontFetch } from "#utils/Front.fetch";
import Events from "./Events";

const template = () => `
  <section id="register">
    <form class="log_sign">
    <div>
    <input type="text" minlength="4" maxlength="30" placeholder="Username (4 - 30 char)" id="username" />
    <p class="error" id="username_error">Your name must have 4 - 30 letters</p>
    </div>
    <div>
    <input type="email" placeholder="Email (e.g. user@example.com)" id="email" pattern="\\w+@\\w+\\.\\w{2,}"  />
    <p class="error" id="email_error">Please enter a valid email address, e.g. user@example.com</p>
    </div>  
    <div>
    <input type="password" id="password" placeholder="Password" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,24}" 
    />
    <p class="error" id="password_error">Password must contain at least one number,  lowercase,  uppercase and special character</p>
    </div>
      <button id="registerbtn">Register</button>
      </form>
      <p class="error" id="asyncErrorReg"></p>
      </section>
`;

const showErrors = (err) => {
  const asyncErrorP = document.querySelector("#asyncErrorReg");

  asyncErrorP.style.display = "block";
  asyncErrorP.innerText = err;
}

const registerSubmit = async () => {
  try {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const email = document.querySelector("#email").value;


    if (!username || !password || !email) return;
    // showErrorsSync(username, password, email);

    const {response, data: dataRes} = await FrontFetch.caller(
      { name: "user", method: "post", action: "register" },
      {
        userName: username,
        email,
        password: password,
      }
    );

    if (response.ok) {
      const { userName, _id, email } = dataRes.user;
      Events({ userName, _id, email });
    } else {
      showErrors(dataRes)
      console.log({dataRes});
      console.log("Error: " + dataRes);
    }
  } catch (err) {
    showErrors(err)
    console.error(new Error("Failed to register from app", err));
  }
};

const Register = () => {
  document.querySelector("main").innerHTML = template();

  document.querySelector("#registerbtn").addEventListener("click", () => {
    registerSubmit();
  });
};

export default Register;
