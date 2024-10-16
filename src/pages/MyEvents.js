import { generateEvent } from "../components/eventList";
import { FrontFetch } from "#utils/Front.fetch";

const template = () => `
<section id="myevents">
  <div>
    <h3>Events purchased</h3>
    <ul id="events-purchased">
    </ul>
  </div>
    <hr />
  <div>
    <h3>Events saved</h3>
    <ul id="events-saved">
    </ul>
  </div>
</section>
`;

const getMyEvents = async () => {
  const {data: eventsData} = await FrontFetch.caller(
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
