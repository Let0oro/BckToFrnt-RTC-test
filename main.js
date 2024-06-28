import "./style.css";

import Events from "./src/pages/Events";

import Login, { loginSubmit } from "./src/pages/Login";

import Register from "./src/pages/Register";

import MyEvents from "./src/pages/MyEvents";

import logout from "./src/utils/logout";

document.querySelector("#eventslink").addEventListener("click", () => Events());

document.querySelector("#loginlink").addEventListener("click", () => Login());

document.querySelector("#registerlink").addEventListener("click", () => Register());

document.querySelector("#myeventslink").addEventListener("click", () => MyEvents());

document.querySelector("#logoutlink").addEventListener("click", logout);


if (document.cookie.length) {
    let cookieObj = document.cookie.replace('%40', '@').split(';').map(v => v.split('=')[1])
    const [email, name, password] = cookieObj;
    loginSubmit(name, password, email)
}