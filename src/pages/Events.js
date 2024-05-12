const template = () => `
  <section id="events">
    ${
      localStorage.getItem("user")
        ? `
        <h3>Welcome ${JSON.parse(localStorage.getItem("user")).userName}</h3>`
        : `<h3>Please, log in</h3>`
    }
    <ul id="eventscontainer">
    </ul>
  </section>
`;

const handleUpdateEvent = async (eventId, status) => {
  try {
    const userId = JSON.parse(localStorage.getItem("user"))._id;

    const response = await fetch(
      `http://localhost:3000/api/v1/events/update/${eventId}/${status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          attendees: [userId],
        }),
      }
    );

    if (response.ok) {
      const responseOk = await response.json();
      console.log(responseOk.message);
    } else {
      console.error(response);
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
      <h4>${event.date
        .map((date) =>
          new Date(date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        )
        .join(" - ")}</h4>
      <h5>Lugar: ${event.location}</h5>
      <h5>Precios: ${event.ticketPrice
        .map((price) => `<li>${price.join(": ")}€</li>`)
        .join(" ")}</h5>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.description}</h5>
      <button class=${
        event.confirmed.includes(userId) || event.attendees.includes(userId)
          ? "none-btn"
          : "registerme-btn"
      } data-event-id="${event._id}">${
      (event.confirmed.includes(userId) && "I`m in") ||
      (event.attendees.includes(userId) && "Still confirmating") ||
      "Register me!"
    }</button>
      ${
        event.confirmed.includes(userId) || event.attendees.includes(userId)
          ? `<button class="unregisterme-btn" data-event-id="${event._id}">I won't go</button>`
          : ""
      }
    `;
    eventsContainer.appendChild(li);

    const registerMe = li.querySelector(".registerme-btn");
    if (!!registerMe) {
      registerMe.addEventListener("click", () => {
        const eventId = registerMe.getAttribute("data-event-id");
        handleUpdateEvent(eventId, "add");
      });
    }

    const unregisterMe = li.querySelector(".unregisterme-btn");
    if (!!unregisterMe) {
      unregisterMe.addEventListener("click", () => {
        const eventId = unregisterMe.getAttribute("data-event-id");
        handleUpdateEvent(eventId, "remove");
      });
    }
  }
};

const Events = () => {
  document.querySelector("main").innerHTML = template();

  getEvents();
};

export default Events;
