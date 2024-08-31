import { FrontFetch } from "#utils/Front.fetch";
import init from "#utils/initWithCookiesSession";
import Login from "./Login";

export const templateUser = async (user, sameUser, index) =>
  user
    ? `
    <h4>${user.userName}</h4>${" "}<span>[${user.rol}]</span>
    <p>Email: ${user.userName}</p>

    ${sameUser ? `<p><b>Events saved:</b></p>
    <ul>
        ${user.eventsSaved.map((evS) => `<li>${evS.title}</li>`)}
    </ul>` : ""}
    <p><b>Events purchased:</b></p>
    <ul>
        ${user.events.map((evP) => `<li>${evP.ticketPriceSelected.join(": ")}</li>`)}
    </ul>
    <p><b>Created at:</b> ${new Date(user.createdAt).toLocaleString()}</p>
    <div>
    ${sameUser ? "" : `<button class="promoteUsrBtn" aria-data-index="${index}" >Promote</button>`}
    <button class="removeUsr${sameUser ? "" : "s"}Btn" >Remove</button></div>
    
`
    : "<h2><i>Has been not possible to get the user info</i></h2>";

const Profile = async () => {
  const cookiesValues = await init();

  if (!cookiesValues) return template(null);

  const { _id: userID } = cookiesValues;

  const user = await FrontFetch.caller({
    name: "user",
    method: "get",
    action: "get",
    id: userID,
  });

  const template = await templateUser(user, true);
  document.querySelector("main").innerHTML = template;

  const removeBtn = document.querySelector(".removeUsrBtn");
  if (removeBtn) {
    removeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await FrontFetch.caller({
        name: "user",
        method: "delete",
        id: userID,
      });
      alert(`User ${user.userName} has been deleted`);
      Register();
    });
  }
};

export default Profile;
