import "./style.css";

import Events from "./src/pages/Events";

import Login from "./src/pages/Login";

import Register from "./src/pages/Register";

import MyEvents from "./src/pages/MyEvents";

import logout from "./src/utils/logout";

document.querySelector("#eventslink").addEventListener("click", () => Events());

document.querySelector("#loginlink").addEventListener("click", () => Login());

document.querySelector("#registerlink").addEventListener("click", () => Register());

document.querySelector("#myeventslink").addEventListener("click", () => MyEvents());

document.querySelector("#logoutlink").addEventListener("click", logout);

Events();
