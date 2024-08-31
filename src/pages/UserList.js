import { FrontFetch } from "#utils/Front.fetch";
import Events from "./Events";
import { templateUser } from "./Profile";

const UserList = async () => {
  const users = await FrontFetch.caller({
    name: "user",
    method: "get",
    action: "get",
  });

  const template = await users.map(async (user, index) => {
    const div = document.createElement("div");
    div.className = "userListLi";

    div.innerHTML = await templateUser(user, false, index);

    return div.outerHTML;
  });

  document.querySelector("main").innerHTML = (await Promise.all(template)).join("");

  if (document.querySelectorAll(".userListLi").length) {

    document.querySelectorAll(".userListLi").forEach((dv, index) => {
      const removeBtn = dv.querySelector(".removeUsrsBtn");
      removeBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (confirm("¿Eliminar a este usuario?"))
          await FrontFetch.caller({
            name: "user",
            method: "delete",
            id: users[index]._id,
          }).then(() => Events());
      });

      const promoteBtn = dv.querySelector(".promoteUsrBtn");
      promoteBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const idIndex = Number(e.target.getAttribute("aria-data-index"));

        if (confirm("¿Promover a este usuario?"))
          await FrontFetch.caller({
            name: "user",
            method: "put",
            action: "promote",
            id: users[idIndex]._id,
          }).then(() => Events());
      });
    });
  }
};

export default UserList;
