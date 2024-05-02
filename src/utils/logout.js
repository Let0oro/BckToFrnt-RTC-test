export default logout = async () => {
  try {
    const { email } = JSON.parse(localStorage.getItem("user"));
    const response = await fetch("http://localhost:3000/api/v1/user/logout", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
    localStorage.removeItem("user");
    alert("See you soon!");

    const responseData = await response.json();
    console.log("Response Logout", responseData);
    Login();
  } catch (err) {
    console.error({ message: "Logout failed", error: err.message });
  }
};

