import { FrontFetch } from "./Front.fetch";

async function checkLoggedInStatus() {
  try {
    const {data, response} = await FrontFetch.caller(
      { name: "user", method: "get", action: "isLog" },
      null,
      { credentials: "include", sameSite: "lax" }
    );
    console.log({response})
    return {response, data};
  } catch (error) {
    console.error("Error checking login status: " + String(error.message));
    return null;
  }
}

async function init() {
  const {response, data: isLoggedIn} = await checkLoggedInStatus();
  if (response.ok) {
    const { userName, _id, rol } = isLoggedIn.user;
    return { userName, _id, rol };
  }
}

export default init;
