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
      alert(
        {
          add: "Evento guardado en tus eventos",
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

export const generateEvent = (event, container, userID = null) => {
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
      <h5><span class="tit" >Lugar:</span> ${event.location}</h5>
      <h5 class="tit" >Precios</h5> <div class="prices">${event.ticketPrice
        .map(
          (price) =>
            `<button class="prices-ticket">${price[0]}: <span class="tit">${price[1]}€</span></button>`
        )
        .join(" ")}</div>
      <h5>${"⭐".repeat(Math.floor(Number(event.rate)))}</h5>
      <h5>${event.description}</h5>
      
      ${
        !!(userID == null)
          ? ""
          : `
      <button class=${
        event.confirmed.includes(userID) ? "none-btn" : ""
      } data-event-id="${event._id}">${
              (event.confirmed.includes(userID) && "I`m in") || "I want to go!"
            }</button>
      `
      }

      ${
        (event.confirmed.includes(userID) &&
          `<button 
        class="unregisterme-btn" data-event-id="${event._id}">I won't go</button>`) ||
        (event.attendees.includes(userID) &&
          `<button 
          class="save-btn" data-event-id="${event._id}">Saved!</button>`) ||
        `<button 
          class="save-btn" data-event-id="${event._id}">Save this!</button>`
      }
    `;
  container.appendChild(li);

  const saveBtn = li.querySelector(".save-btn");
  if (!!saveBtn) {
    saveBtn.addEventListener("click", () => {
      const eventId = saveBtn.getAttribute("data-event-id");
      handleUpdateEvent(userID, eventId, "add", mail);
      // getEvents(userID)
    });
  }

  const ticketButton = li.querySelectorAll(".prices-ticket");
  if (!!ticketButton) {
    ticketButton.forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const text = e.target.textContent;
        const eventID = event._id;
        console.log(text);
      })
    );
  }

  const unregisterMe = li.querySelector(".unregisterme-btn");
  if (!!unregisterMe) {
    unregisterMe.addEventListener("click", () => {
      const eventId = unregisterMe.getAttribute("data-event-id");
      handleUpdateEvent(userID, eventId, "remove");
      // getEvents(userID)
    });
  }
};
