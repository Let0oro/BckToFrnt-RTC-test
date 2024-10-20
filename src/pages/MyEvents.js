import { generateEvent } from "../components/eventList";
import { FrontFetch } from "#utils/Front.fetch";

const template = () => `
<section id="myevents">
  <div>
    <h3>Events purchased</h3>
    <ul id="events-purchased">
      <h2 class='load'>Loading events...</h2>
    </ul>
  </div>
  <div>
    <h3>Events saved</h3>
    <ul id="events-saved">
      <h2 class='load'>Loading events...</h2>
    </ul>
  </div>
</section>
`;

const getMyEvents = async () => {
  const { data: eventsData } = await FrontFetch.caller(
    { name: "events", method: "get", action: "myEvents" },
    null,
    { credentials: "include" }
  );

  const { events: purchased, eventsSaved: saved, userID } = await eventsData;
  const eventsPurchased = document.querySelector("#events-purchased");
  const eventsSaved = document.querySelector("#events-saved");

  if (!purchased.length || !purchased.filter(({ _id }) => _id).length) {
    eventsPurchased.innerHTML = "<h2 class='load'><i>Has been not possible to get the event info</i></h2>";
  } else {
    await purchased.filter(({ _id }) => _id).forEach(
      async ({ _id: event, ticketPriceSelected }) =>
        await generateEvent(
          event,
          eventsPurchased,
          userID,
          ticketPriceSelected,
          false
        )
    );
  }

  if (!saved.length) {
    eventsSaved.innerHTML = "<h2 class='load'><i>Has been not possible to get the event info</i></h2>";
  } else {
    saved.forEach(async (event) =>
      await generateEvent(event, eventsSaved, userID, null, false)
    );
  }

};

const MyEvents = () => {
  document.querySelector("main").innerHTML = template();
  getMyEvents();
};

export default MyEvents;
