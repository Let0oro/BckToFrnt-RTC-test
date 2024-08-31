import { FrontFetch } from "#utils/Front.fetch";
import { templateUser } from "./Profile";

const UserList = async () => {
  const users = await FrontFetch.caller({
    name: "user",
    method: "get",
    action: "get",
  });

  console.log(
    await users.map(async (user, index) => {
      const div = document.createElement("div");
      console.log({user});
      div.innerHTML = await templateUser(user, false, index);
      return div.innerHTML;
    })
  );

  const template = await users.map(async (user, index) => {
    const div = document.createElement("div");
    div.className = "userListLi";

    div.innerHTML = await templateUser(user, false, index);

    return div.outerHTML;
  });

  document.querySelector("main").innerHTML = (await Promise.all(template)).join("");

  if (document.querySelectorAll(".userListLi").length) {
    console.log(document.querySelector(".userListLi"));
    console.log({
      promoteBtn: document.querySelector(".promoteUsrBtn"),
      removeBtn: document.querySelector(".removeUsrsBtn"),
    });

    document.querySelectorAll(".userListLi").forEach((dv, index) => {
      const removeBtn = dv.querySelector(".removeUsrsBtn");
      removeBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log(e.target, index);

        if (confirm("¿Eliminar a este usuario?"))
          await FrontFetch.caller({
            name: "user",
            method: "delete",
            id: users[index],
          }).then(() => Login());
      });

      const promoteBtn = dv.querySelector(".promoteUsrBtn");
      promoteBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const idIndex = Number(e.target.getAttribute("aria-data-index"));
        console.log(e.target, idIndex);
        if (confirm("¿Promover a este usuario?"))
          await FrontFetch.caller({
            name: "user",
            method: "put",
            action: "promote",
            id: users[idIndex],
          }).then(() => Login());
      });
    });
  }
};

export default UserList;
