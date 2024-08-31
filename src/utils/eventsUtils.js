import Events from "#pages/Events";
import MyEvents from "#pages/MyEvents";
import { FrontFetch } from "./Front.fetch";

const reloadPage = async (isFromGeneral) => {
  setTimeout(() => {
    if (isFromGeneral) {
      console.log({isFromGeneral, to: "Events"})
      Events()
    } else {
      console.log({isFromGeneral, to: "MyEvents"})
      MyEvents()
    }
    // (isFromGeneral ? () => Events() : () => MyEvents())();

  }, 100)
}

const handleUpdateEvent = async (userID, eventId, status, mail = null) => {
  try {
    const data = await FrontFetch.caller(
      { name: "events", method: "put", id: eventId, status },
      { attendees: [userID] }
    );

    if (status == "save" || status == "remove")
      alert(
        {
          save: "Evento guardado en tus eventos",
          remove: "Se ha cancelado la compra de este evento",
        }[status]
      );
  } catch (error) {
    console.error("Unexpected error", error);
  }
};

async function handleTicketPurchase(e, event) {
  e.preventDefault();
  const [selectedTitle, selectedPrice] = e.target.textContent.split(": ").map(p => p.trim());
  const eventID = event._id;

  if (
    confirm(
      `Do you want to purchase the ${selectedTitle} ticket of ${event.title}?`
    )
  )
    await FrontFetch.caller(
      { name: "events", method: "put", id: eventID, status: "confirm" },
      {
        selectedPrice: String(selectedPrice.replaceAll(/[^0-9]/gi, "")),
        selectedTitle,
      }
    )
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
}

export const generateEvent = async (
  event,
  container,
  userID = null,
  ticketSelected = null,
  isFromGeneral
) => {
  // console.log({ event, container });
  const li = document.createElement("li");
  const user = await FrontFetch.caller(
    { name: "user", method: "get", action: "get", id: userID },
    null,
    { credentials: "include" }
  );

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
      <h4><span class="tit" >Lugar:</span> ${event.location}</h4>
      <h4 class="tit" >Precios</h4> <div class="prices">${
        !ticketSelected
          ? event.ticketPrice
              .map((price, i) => {
                // console.log(price);
                // console.log(event)
                return `<button class=${"prices-ticket"}>${price[0]}: <span class="tit">${price[1]}€</span></button>`;
              })
              .join(" ")
          : `<button>${ticketSelected[0]}: <span class="tit">${ticketSelected[1]}€</span></button>`
      }</div>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.description}</h5>
  
      ${
        event.confirmed.includes(userID)
          ? `<button 
      class="unregister-btn" data-event-id="${event._id}">I won't go</button>`
          : ""
      }
  ${
    event.attendees.includes(userID)
      ? `<button 
      class="unsave-btn" data-event-id="${event._id}">Unsave!</button>`
      : userID
        ? `<button 
      class="save-btn" data-event-id="${event._id}">Save this!</button>`
        : ""
  }
    `;
  container.appendChild(li);

  const saveBtn = li.querySelector(".save-btn");
  const unSaveBtn = li.querySelector(".unsave-btn");

  if (saveBtn || unSaveBtn) {
    [saveBtn, unSaveBtn].forEach(
      (btn, i) =>
        btn &&
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const eventId = btn.getAttribute("data-event-id");
          const status = ["save", "unsave"][i];

          handleUpdateEvent(userID, eventId, status).then(() => {
            reloadPage(isFromGeneral)
          })
        })
    );
  }

  const ticketBtn = li.querySelectorAll(".prices-ticket");
  if (ticketBtn && userID) {
    ticketBtn.forEach((btn) =>
      btn.addEventListener("click", (e) =>
        handleTicketPurchase(e, event).then(() => {
          reloadPage(isFromGeneral)
        })
      )
    );
  }

  const unRegisterBtn = li.querySelector(".unregister-btn");
  if (!!unRegisterBtn) {
    unRegisterBtn.addEventListener("click", () => {
      const eventId = unRegisterBtn.getAttribute("data-event-id");
      if (confirm(`Do you want to cancel your purchase at ${event.title}?`))
        handleUpdateEvent(userID, eventId, "remove").then(() => {
          reloadPage(isFromGeneral)
        });
    });
  }
};
