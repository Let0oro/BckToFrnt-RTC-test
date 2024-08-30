import { generateEvent } from "#utils/eventsUtils";
import { FrontFetch } from "#utils/Front.fetch";

const template = () => `
<section id="myevents">
  <h3>Events purchased</h3>
  <ul id="events-purchased">
  </ul>
  <hr/>
  <h3>Events saved</h3>
  <ul id="events-saved">
  </ul>
</section>
`;

const getMyEvents = async () => {
  const eventsData = await FrontFetch.caller(
    { name: "events", method: "get", action: "myEvents" },
    null,
    { credentials: "include" }
  );

  const { events: purchased, eventsSaved: saved, userID } = await eventsData;
  const eventsPurchased = document.querySelector("#events-purchased");
  const eventsSaved = document.querySelector("#events-saved");

  purchased.forEach(
    async ({ _id: event, ticketPriceSelected }) =>
      await generateEvent(
        event,
        eventsPurchased,
        userID,
        ticketPriceSelected,
        false
      )
  );
  await saved.forEach(async (event) =>
    generateEvent(event, eventsSaved, userID, null, false)
  );
};

const MyEvents = () => {
  document.querySelector("main").innerHTML = template();
  getMyEvents();
};

export default MyEvents;
