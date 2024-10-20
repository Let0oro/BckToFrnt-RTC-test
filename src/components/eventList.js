
import Events from "#pages/Events";
import MyEvents from "#pages/MyEvents";
import { FrontFetch } from "../utils/Front.fetch";
import notyfication from "#utils/notyfication";
import callModal from "#utils/callModal";

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const reloadPage = debounce(async (isFromGeneral) => {
  try {
    const currentYScroll = window.scrollY;


    const eventsContainer = document.querySelector("#events");
    if (eventsContainer) {
      eventsContainer.innerHTML = '';
    }

    const myEventsContainer = document.querySelector("#myevents");
    if (myEventsContainer) {
      myEventsContainer.innerHTML = '';
    }

    if (isFromGeneral && typeof Events === 'function') {
      await Events();
      window.scrollTo({ top: currentYScroll });
    } else if (!isFromGeneral && typeof MyEvents === 'function') {
      await MyEvents();
      window.scrollTo({ top: currentYScroll });
    }

  } catch (error) {
    console.error("Error en reloadPage: ", error);
  }
}, 500);



const handleUpdateEvent = async (isFromGeneral, userID, eventId, status) => {
  try {
    await FrontFetch.caller(
      { name: "events", method: "put", id: eventId, status },
      { attendees: [userID] }
    );

    if (status.length) {
      console.log({ status })
      notyfication(
        "success",
        {
          save: "Evento guardado en tus eventos",
          remove: "Se ha cancelado la compra de este evento",
          unsave: "Evento eliminado de guardados",
        }[status]
      );
    }
  } catch (error) {
    console.error("Unexpected error", error);
  } finally {
    reloadPage(isFromGeneral);
  }
};


async function handleTicketPurchase(e, event, isFromGeneral) {
  e.preventDefault();
  const [selectedTitle, selectedPrice] = e.target.textContent
    .split(": ")
    .map((p) => p.trim());
  const eventID = event._id;

  const ticketPurchFunct = async () => {
    const { response, data } = await FrontFetch.caller(
      { name: "events", method: "put", id: eventID, status: "confirm" },
      {
        selectedPrice: String(selectedPrice.replaceAll(/[^0-9]/gi, "")),
        selectedTitle,
      }
    );

    if (!response.ok) {
      console.log({ data })
      notyfication("error", data || data.error);
    } else {
      notyfication("success", data || data.message);
      reloadPage(isFromGeneral);
    }
  };
  callModal("Do you want to confirm the purchase?", ticketPurchFunct);
}


export const generateEvent = async (
  event,
  container,
  userID = null,
  ticketSelected = null,
  isFromGeneral
) => {
  const li = document.createElement("li");
  let userNames;

  try {
    userNames = await Promise.all(
      event?.confirmed.map(async (confId) => {
        const { data: dataUser } = await FrontFetch.caller({
          name: "user",
          method: "get",
          action: "get",
          id: confId,
        });
        return dataUser.userName;
      })
    );
  } catch (error) {
    console.error(error);
  }

  if (container.querySelector("h2.load")) {
    container.querySelector("h2.load").remove();
  }

  li.innerHTML = `
    <br/>
    <div class="event_card">
      <img src=${event.image} alt=${event.title} height="300"/>
      <h3>${event.title}</h3>
      <h4>${event.date.map(date => new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })).join(" - ")}</h4>
      <h4><span class="tit">Lugar:</span> ${event.location}</h4>
      <h4 class="tit">Precios</h4>
      <div class="prices">${!ticketSelected
      ? event.ticketPrice.map(price => `
            <button ${event.confirmed.includes(userID) ? "disabled" : ""} class="prices-ticket">${price[0]}: <span class="tit">${price[1]}€</span></button>`
      ).join(" ")
      : `<button>${ticketSelected[0]}: <span class="tit">${ticketSelected[1]}€</span></button>`
    }</div>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <p>${event.description}</p>
      ${userNames.length ? `
        <p><b>Assistants:</b> ${[...userNames].slice(0, 5).join(", ")} ${userNames.length > 5 ? `${userNames.length - 5}+` : ""}</p>` : ""}
      ${event.confirmed.includes(userID) ? `
        <button class="unregister-btn" data-event-id="${event._id}">I won't go</button>` : ""}
      ${event.attendees.includes(userID) ? `
        <button class="unsave-btn" data-event-id="${event._id}">Unsave!</button>` : userID ? `
        <button class="save-btn" data-event-id="${event._id}">Save this!</button>` : ""}
    </div>
  `;
  container.appendChild(li);


  li.addEventListener("click", async (e) => {
    const target = e.target;
    if (target.matches(".save-btn") || target.matches(".unsave-btn")) {
      e.preventDefault();
      const eventId = target.getAttribute("data-event-id");
      const status = target.matches(".save-btn") ? "save" : "unsave";
      await handleUpdateEvent(isFromGeneral, userID, eventId, status);
    }
  });


  li.addEventListener("click", (e) => {
    if (e.target.matches(".prices-ticket")) {
      handleTicketPurchase(e, event, isFromGeneral);
    }
  });


  const unRegisterBtn = li.querySelector(".unregister-btn");
  if (unRegisterBtn) {
    unRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const eventId = unRegisterBtn.getAttribute("data-event-id");
      callModal(`Do you want to cancel your purchase at ${event.title}?`, handleUpdateEvent, isFromGeneral, userID, eventId, "remove");
    });
  }
};

