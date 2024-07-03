import "./style.css";

import Events from "#pages/Events";
import Login from "#pages/Login";
import Register from "#pages/Register";
import MyEvents from "#pages/MyEvents";
import logout from "#utils/logout";

document.querySelector("#eventslink").addEventListener("click", Events);

document.querySelector("#loginlink").addEventListener("click", Login);

document.querySelector("#registerlink").addEventListener("click", Register);

document.querySelector("#myeventslink").addEventListener("click", MyEvents);

document.querySelector("#logoutlink").addEventListener("click", logout);

async function checkLoggedInStatus() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/user/is_logged_in",
      {
        credentials: "include", // Esto, junto a sameSite: lax, va a permitir acceder a las cookies
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking login status: %s", error.message);
  }
}

async function init() {
  const isLoggedIn = await checkLoggedInStatus();
  if (!!isLoggedIn) {
    const { userName, email, password } = isLoggedIn.user;
    document.getElementById("logoutlink").style.display = "none";
    document.getElementById("myeventslink").style.display = "inline-block";
    Events({ userName, password, email });
  } else {
    document.getElementById("logoutlink").style.display = "inline-block";
    document.getElementById("myeventslink").style.display = "none";
  }
}

init();
