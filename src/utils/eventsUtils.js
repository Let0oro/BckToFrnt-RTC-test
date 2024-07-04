import Events from "#pages/Events";
import MyEvents from "#pages/MyEvents";

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
      if (status == "save" || status == "remove")
        alert(
          {
            save: "Evento guardado en tus eventos",
            remove: "Se ha cancelado la compra de este evento",
          }[status]
        );
    } else {
      console.error(response);
      const responseError = await response.json();
      console.error(responseError);
    }
  } catch (error) {
    console.error("Unexpected error", error);
  }
};

export const generateEvent = (event, container, userID = null, ticketSelected = null, isFromGeneral) => {
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
      <h4><span class="tit" >Lugar:</span> ${event.location}</h4>
      <h4 class="tit" >Precios</h4> <div class="prices">${!ticketSelected ? event.ticketPrice
        .map(
          (price) =>
            `<button class="prices-ticket">${price[0]}: <span class="tit">${price[1]}€</span></button>`
        )
        .join(" ") :
        `<button>${ticketSelected[0]}: <span class="tit">${ticketSelected[1]}€</span></button>`
      
      }</div>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.description}</h5>
  
      ${
        !!event.confirmed.includes(userID)
          ? `<button 
      class="unregister-btn" data-event-id="${event._id}">I won't go</button>`
          : ""
      }
  ${
    !!event.attendees.includes(userID)
      ? `<button 
      class="unsave-btn" data-event-id="${event._id}">Unsave!</button>`
      : !!userID
      ? `<button 
      class="save-btn" data-event-id="${event._id}">Save this!</button>`
      : ""
  }
    `;
  container.appendChild(li);

  const saveBtn = container.querySelector(".save-btn");
  const unSaveBtn = container.querySelector(".unsave-btn");

  if (!!saveBtn || !!unSaveBtn) {
    [saveBtn, unSaveBtn].forEach(
      (btn, i) =>
        btn &&
        btn.addEventListener("click", () => {
          const eventId = btn.getAttribute("data-event-id");
          handleUpdateEvent(userID, eventId, ["save", "unsave"][i]);
          isFromGeneral ? Events() : MyEvents();
        })
    );
  }

  const ticketBtn = container.querySelectorAll(".prices-ticket");
  if (!!ticketBtn) {
    ticketBtn.forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const [selectedTitle, selectedPrice] = e.target.textContent.split(': ')
        const eventID = event._id;

        if (
          confirm(
            `Do you want to purchase the ${selectedTitle} ticket of ${event.title}?`
          )
        ) fetch(
            `http://localhost:3000/api/v1/events/update/${eventID}/confirm`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              method: "PUT",
              body: JSON.stringify({
                selectedPrice: selectedPrice.replaceAll(/[^0-9]/gi, ''),
                selectedTitle
              }),
            }
          )
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error(error));
      })
    );
  }

  const unRegisterBtn = document.querySelector(".unregister-btn");
  if (!!unRegisterBtn) {
    unRegisterBtn.addEventListener("click", () => {
      const eventId = unRegisterBtn.getAttribute("data-event-id");
      if (confirm(`Do you want to cancel your purchase at ${event.title}?`))
        handleUpdateEvent(userID, eventId, "remove");
        isFromGeneral ? Events() : MyEvents();
    });
  }
};
