async function checkLoggedInStatus() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/user/is_logged_in",
      {
        credentials: "include", // Esto, junto a sameSite: lax, va a permitir acceder a las cookies
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
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
