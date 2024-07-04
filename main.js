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

Events();