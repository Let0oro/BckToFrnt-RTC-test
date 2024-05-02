const template = () => `
  <section id="events">
    ${
      localStorage.getItem("user") ? `
        <h3>Welcome User</h3>` : `<h3>Please, log in</h3>`
    }
    <ul id="eventscontainer">
    </ul>
  </section>
`;

const handleAddToFavorites = async (eventId) => {
  try {
    const userId = JSON.parse(localStorage.getItem("user"))._id;

    const response = await fetch(
      `http://localhost:3000/api/v1/user/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          favs: [eventId],
        }),
      }
    );

    if (response.ok) {
      console.log("Evento añadido");
    } else {
      const responseError = await response.json();
      console.error(responseError);
    }
  } catch (error) {
    console.error("Error inesperado", error);
  }
};

const getEvents = async () => {
  const eventsData = await fetch("http://localhost:3000/api/v1/events/");
  
  let events = await eventsData.json();
  events = events.events;
  const eventsContainer = document.querySelector("#eventscontainer");
  
  for (const event of events) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src=${event.front} alt=${event.title} height="300"/>
      <h3>Título: ${event.title}</h3>
      <h4>Autor: ${event.author}</h4>
      <h5>Year: ${event.year}</h5>
      <h5>Editorial: ${event.editorial}</h5>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.price}€</h5>
      <button class="registerme-btn" data-event-id="${event._id}">❤️</button>
    `;
    eventsContainer.appendChild(li);

    const registerMe = li.querySelector(".registerme-btn");
    if (!!registerMe) {
      registerMe.addEventListener("click", () => {
        const eventId = registerMe.getAttribute("data-event-id");
        handleAddToFavorites(eventId);
      });
    }
  }
};

const Events = () => {
  document.querySelector("main").innerHTML = template();
  
  getEvents();
};

export default Events;
