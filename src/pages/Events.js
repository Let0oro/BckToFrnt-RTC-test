import { generateEvent } from "#utils/eventsUtils";

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

const getEvents = async (userID = null, mail) => {
  const eventsData = await fetch("http://localhost:3000/api/v1/events/");

  let events = await eventsData.json();
  events = events.events;
  const eventsContainer = document.querySelector("#eventscontainer");

  events.forEach(event => generateEvent(event, eventsContainer, userID))
};

const Events = (user = { userName: null, _id: null, email: null }) => {
  const { userName, _id: userID, email: mail } = user;
  document.querySelector("main").innerHTML = template(userName);

  getEvents(userID, mail);
};

export default Events;
