import Events from "#pages/Events";
import MyEvents from "#pages/MyEvents";
import { FrontFetch } from "../utils/Front.fetch";
import notyfication from "#utils/notyfication";
import callModal from "#utils/callModal";

const reloadPage = async (isFromGeneral) => {
  setTimeout(async () => {
    const currentYScroll = window.scrollY;
    if (isFromGeneral) {
      await Events().then(() => window.scrollTo({top: currentYScroll}));
    } else {
      await MyEvents().then(() =>window.scrollTo({top: currentYScroll}));
    }

  }, 100);
};

const handleUpdateEvent = async (isFromGeneral, userID, eventId, status, mail = null) => {
  try {
    await FrontFetch.caller(
      { name: "events", method: "put", id: eventId, status },
      { attendees: [userID] }
    );

    if (status.length) {
      notyfication("success", {
        save: "Evento guardado en tus eventos",
        remove: "Se ha cancelado la compra de este evento",
        unsave: "Evento eliminado de guardados"          
      }[status])
      }
  } catch (error) {
    console.error("Unexpected error", error);
  } finally {
    reloadPage(isFromGeneral)
  }
};

async function handleTicketPurchase(e, event, isFromGeneral) {
  e.preventDefault();
  const [selectedTitle, selectedPrice] = e.target.textContent
    .split(": ")
    .map((p) => p.trim());
  const eventID = event._id;


  const ticketPurchFunct = async ( ) => {
    const { response, data } = await FrontFetch.caller(
      { name: "events", method: "put", id: eventID, status: "confirm" },
      {
        selectedPrice: String(selectedPrice.replaceAll(/[^0-9]/gi, "")),
        selectedTitle,
      }
    );

    if (!response.ok) {
      notyfication("error", data)
    } else {
      notyfication("success", data)
      reloadPage(isFromGeneral)
    }
  }
  callModal("Do you want to confirm the purchase?", ticketPurchFunct)
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
  let loading = true;


  try {
    userNames = await Promise.all(
      event.confirmed.map(async (confId) => {
        const {data: dataUser} = await FrontFetch.caller({
          name: "user",
          method: "get",
          action: "get",
          id: confId,
        });
        return dataUser.userName;
      })
    );
  } catch {
    console.error(error);
  } finally {
    loading = false;
    // console.log({userID, ticketSelected, event, userNames})
  }

  li.innerHTML = userNames
    ? `
    <br/>
    <div class="event_card">
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
              .map(
                (price, i) =>
                  `<button ${event.confirmed.includes(userID) ? "disabled" : ""} class=${"prices-ticket"}>${price[0]}: <span class="tit">${price[1]}€</span></button>`
              )
              .join(" ")
          : `<button>${ticketSelected[0]}: <span class="tit">${ticketSelected[1]}€</span></button>`
      }</div>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.description}</h5>
      ${userNames.length ? `<p><b>Assistants:</b> ${[...userNames].slice(0, 5).join(", ")}${userNames.length > 5 ? `${userNames.length - 5}+` : ""}</p>` : ""}
  
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
        </div>
    `
    : loading
      ? "<h2>Loading...</h2>"
      : "<h2><i>Has been not possible to get the event info</i></h2>";
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

          handleUpdateEvent(isFromGeneral, userID, eventId, status);
        })
    );
  }

  const ticketBtn = li.querySelectorAll(".prices-ticket");
  if (ticketBtn && userID) {
    ticketBtn.forEach((btn) =>
      btn.addEventListener("click", (e) => handleTicketPurchase(e, event, isFromGeneral))
    );
  }

  const unRegisterBtn = li.querySelector(".unregister-btn");
  if (unRegisterBtn) {
    unRegisterBtn.addEventListener("click", async () => {
      const eventId = unRegisterBtn.getAttribute("data-event-id");

      callModal( `Do you want to cancel your purchase at  ${event.title}?`, handleUpdateEvent, isFromGeneral, userID, eventId, "remove")
  })}
};
