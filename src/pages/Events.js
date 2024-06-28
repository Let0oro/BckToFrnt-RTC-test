import nodeMail from "../utils/nodemailer";

const template = (userName = null) => `
  <section id="events">
    ${
      !(userName == null)
        ? `
        <h3>Welcome ${userName}</h3>`
        : `<h3>Please, log in</h3>`
    }
    <ul id="eventscontainer">
    </ul>
  </section>
`;

const handleUpdateEvent = async (userID, eventId, status, mail = null) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/events/update/${eventId}/${status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          attendees: [userID],
        }),
      }
    );

    if (response.ok) {
      const responseOk = await response.json();
      console.log(responseOk.message);
      if (status === "add") nodeMail(mail);
      alert({'add': 'Se te ha enviado un correo electrónico para confirmar la compra', 'remove': 'Se ha cancelado la compra de este evento'}[status])
    } else {
      console.error(response);
      const responseError = await response.json();
      console.error(responseError);
    }
  } catch (error) {
    console.error("Unexpected error", error);
  }
};

const getEvents = async (userID = null, mail) => {
  const eventsData = await fetch("http://localhost:3000/api/v1/events/");

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
      
      ${!!(userID == null) ? '' : `
      <button class=${
        event.confirmed.includes(userID) || event.attendees.includes(userID)
          ? "none-btn"
          : "registerme-btn"
      } data-event-id="${event._id}">${
      (event.confirmed.includes(userID) && "I`m in") ||
      (event.attendees.includes(userID) && "Still confirmating") ||
      "Register me!"
    }</button>
      `}

      ${
        event.confirmed.includes(userID) || event.attendees.includes(userID)
          ? `<button class="unregisterme-btn" data-event-id="${event._id}">I won't go</button>`
          : ""
      }
    `;
    eventsContainer.appendChild(li);

    const registerMe = li.querySelector(".registerme-btn");
    if (!!registerMe) {
      registerMe.addEventListener("click", () => {
        const eventId = registerMe.getAttribute("data-event-id");
        handleUpdateEvent(userID, eventId, "add", mail);
        // getEvents(userID)
      });
    }

    const unregisterMe = li.querySelector(".unregisterme-btn");
    if (!!unregisterMe) {
      unregisterMe.addEventListener("click", () => {
        const eventId = unregisterMe.getAttribute("data-event-id");
        handleUpdateEvent(userID, eventId, "remove");
        // getEvents(userID)
      });
    }
  }
};

const Events = (user = {userName: null, _id: null, email: null}) => {
  const {userName, _id: userID, email: mail} = user;
  console.log('EVENTS', user)
  document.querySelector("main").innerHTML = template(userName);

  getEvents(userID, mail);
};

export default Events;
