import "./style.css";

import Events from "#pages/Events";
import Login from "#pages/Login";
import Register from "#pages/Register";
import MyEvents from "#pages/MyEvents";
import logout from "#utils/logout";
import newEvent from "#pages/newEvent";
import UserList from "#pages/UserList";
import Profile from "#pages/Profile";

document.querySelector("#eventslink").addEventListener("click", Events);

document.querySelector("#loginlink").addEventListener("click", Login);

document.querySelector("#registerlink").addEventListener("click", Register);

document.querySelector("#myeventslink").addEventListener("click", MyEvents);

document.querySelector("#neweventlink").addEventListener("click", newEvent);

document.querySelector("#userlistlink").addEventListener("click", UserList);

document.querySelector("#profilelink").addEventListener("click", Profile);

document.querySelector("#logoutlink").addEventListener("click", logout);

Events();

[...document.querySelectorAll("header > a")].forEach((a, i, arr) => {
  a.addEventListener("click", ({target}) => {
    arr.forEach((link) => link.classList.remove("active"));
    target.classList.add("active");
  });
});
