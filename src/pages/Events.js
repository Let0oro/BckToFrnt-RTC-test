import { generateEvent } from "#utils/eventsUtils";
import init from "#utils/initWithCookiesSession";

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

const getEvents = async (userID = null) => {
  const eventsData = await fetch("http://localhost:3000/api/v1/events/");

  let events = await eventsData.json();
  events = events.events;
  const eventsContainer = document.querySelector("#eventscontainer");

  events.forEach(event => generateEvent(event, eventsContainer, userID))
};

const Events = async (user = { userName: null, _id: null}) => {

  const cookiesValues = await init();
  if (!user._id && !cookiesValues) return;
    const { userName, _id: userID } = !!user._id ? user : cookiesValues;
    document.querySelector("main").innerHTML = template(userName);
    
    await getEvents(userID);
};

export default Events;
