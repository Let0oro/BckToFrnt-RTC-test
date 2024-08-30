import { FrontFetch } from "./Front.fetch";

async function checkLoggedInStatus() {
  try {
    const data = FrontFetch.caller(
      { name: "user", method: "get", action: "isLog" },
      null,
      { credentials: "include", sameSite: "lax" }
    );
    return data;
  } catch (error) {
    console.error("Error checking login status: %s", String(error.message));
    return null;
  }
}

async function init() {
  const isLoggedIn = await checkLoggedInStatus();
  if (!!isLoggedIn) {
    const { userName, _id } = isLoggedIn.user;
    // document.getElementById("logoutlink").style.display = "none";
    // document.getElementById("myeventslink").style.display = "inline-block";
    // document.querySelector("#loginlink").style.display = "none"
    // document.querySelector("#registerlink").style.display = "none"
    return { userName, _id };
  } else {
    // document.getElementById("logoutlink").style.display = "inline-block";
    // document.querySelector("#loginlink").style.display = "inline-block"
    // document.querySelector("#registerlink").style.display = "inline-block"
    // document.getElementById("myeventslink").style.display = "none";
  }
}

export default init;
