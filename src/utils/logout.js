import Login from "#pages/Login";
import { FrontFetch } from "./Front.fetch";

const logout = async () => {
  try {
    await FrontFetch.caller({name: "user", method: "post", action: "logout"}, null, { credentials: "include" })

    alert("See you soon!");

    Login();
  } catch (err) {
    console.error({ message: "Logout failed", error: err.message });
  }
};

export default logout;