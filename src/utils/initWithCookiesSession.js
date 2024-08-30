import { FrontFetch } from "./Front.fetch";

async function checkLoggedInStatus() {
  try {
    const data = await FrontFetch.caller(
      { name: "user", method: "get", action: "isLog" },
      null,
      { credentials: "include", sameSite: "lax" }
    );
    return data;
  } catch (error) {
    console.error("Error checking login status: " + String(error.message));
    return null;
  }
}

async function init() {
  const isLoggedIn = await checkLoggedInStatus();
  if (isLoggedIn) {
    const { userName, _id } = isLoggedIn.user;
    return { userName, _id };
  }
}

export default init;
