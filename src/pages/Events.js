const template = () => `
  <section id="events">
    ${
      localStorage.getItem("user") ? `
        <h3>Welcome ${JSON.parse(localStorage.getItem("user")).userName}</h3>` : `<h3>Please, log in</h3>`
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
  const userId = JSON.parse(localStorage.getItem("user"))._id;
  
  let events = await eventsData.json();
  events = events.events;
  const eventsContainer = document.querySelector("#eventscontainer");
  
  for (const event of events) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src=${event.image} alt=${event.title} height="300"/>
      <h3>${event.title}</h3>
      <h4>${event.date.map(date => new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })).join(" - ")}</h4>
      <h5>Lugar: ${event.location}</h5>
      <h5>Precios: ${event.ticketPrice.map(price => `<li>${price.join(": ")}€</li>`).join(" ")}</h5>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.description}</h5>
      <button class="registerme-btn" data-event-id="${event._id}">${
        event.confirmed.includes(event._id) && "I`m in"
        || event.confirmed.includes(event._id) && "Still confirmating"
        || "Register me!"
        }</button>
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
