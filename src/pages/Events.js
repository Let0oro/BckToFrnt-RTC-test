import { generateEvent } from "../components/eventList";
import { FrontFetch } from "#utils/Front.fetch";
import init from "#utils/initWithCookiesSession";

const template = (userName = null) => `
  <section id="events">
    ${!(userName == null)
    ? `
        <h3>Welcome ${userName}</h3>`
    : `<h3>Please, log in</h3>`
  }
    <ul id="eventscontainer">
      <h2 class='load'>Loading events...</h2>
    </ul>
  </section>
`;

const getEvents = async (userID = null) => {
  const { data: { events } } = await FrontFetch.caller({
    name: "events",
    method: "get",
    action: "get",
  });

  const eventsContainer = document.querySelector("#eventscontainer");

  if (eventsContainer) {
    // const eventsSorted = await events.sort(({createdAt: a}, {createdAt: b}) => new Date(b).getTime() - new Date(a).getTime());
    const eventsSorted = await events.sort(({ title: a }, { title: b }) => a.localeCompare(b));
    await eventsSorted.forEach((event) =>
      generateEvent(event, eventsContainer, userID, null, true)
    );
  }
};

const elemsIdStyleTo = (obj) => {
  const keys = Object.keys(obj);
  keys.forEach((k, i) => {
    obj[k].forEach((id) => (document.getElementById(id).style.display = k));
  });
};

const Events = async (user = { userName: null, _id: null, rol: null }) => {
  const cookiesValues = await init();

  let objIds;
  if (user._id || cookiesValues) {
    user = user._id ? user : cookiesValues;

    objIds = {
      "inline-block": [
        "logoutlink",
        "myeventslink",
        "neweventlink",
        "eventslink",
      ],
      none: ["loginlink", "registerlink"],
    };

    if (user.rol == "admin") elemsIdStyleTo({ "inline-block": ["userlistlink", "profilelink"] });
  } else {
    objIds = {
      "inline-block": ["loginlink", "registerlink", "eventslink"],
      none: ["logoutlink", "myeventslink", "neweventlink", "userlistlink", "profilelink"],
    }
  }
  elemsIdStyleTo(objIds);

  document.querySelector("main").innerHTML = template(user.userName);
  await getEvents(user._id);
};

export default Events;
