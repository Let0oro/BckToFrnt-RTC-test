import Login from "#pages/Login";

const logout = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/v1/user/logout", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
    });
    alert("See you soon!");

    Login();
  } catch (err) {
    console.error({ message: "Logout failed", error: err.message });
  }
};

export default logout;