import { generateEvent } from "#utils/eventsUtils";

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
  const eventsData = await fetch(
    `http://localhost:3000/api/v1/events/my_events`,
    { credentials: "include" }
  );
  const {events: purchased, eventsSaved: saved, userID} = await eventsData.json();
  const eventsPuchased = document.querySelector("#events-purchased");
  const eventsSaved = document.querySelector("#events-saved");

  purchased.forEach((event) => generateEvent(event, eventsPuchased, userID));
  saved.forEach((event) => generateEvent(event, eventsSaved, userID));
};

const MyEvents = () => {
  document.querySelector("main").innerHTML = template();
  getMyEvents();
};

export default MyEvents;
