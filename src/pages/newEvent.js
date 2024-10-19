import callModal from "#utils/callModal";
import { FrontFetch } from "#utils/Front.fetch";
import notyfication from "#utils/notyfication";

const handleSubmit = async (bodyPost) => {
  const dataRes = await FrontFetch.caller(
    { name: "events", method: "post" },
    { ...bodyPost }
  );

  if (dataRes) {
    document
      .querySelectorAll("form input")
      .forEach((inp) =>
        inp.id == "image" ? (inp.files = null) : (inp.value = "")
      );
    document.querySelector("form textarea#description").value = "";
    document
      .querySelectorAll("form #priceList li")
      .forEach((inp) => inp.remove());
    notyfication("success", "Evento publicado con éxito!");
  }
};

const template = () => {
  return `
      <section>
        <form class="newev" onkeydown="if(event.keyCode === 13) {return false;}" >

          <fieldset>
            <legend>Title</legend>
            <input type="text" require name="title" minlength="5" maxlength="90" id="title" placeholder="Título de Evento" />
          </fieldset>
          
          <fieldset>
            <legend>Image</legend>
            <div class="file-select" id="imageDiv" >
                <input type="file" multiple="false" id="image" require accept="image/png, image/jpeg, image/webg, image/png" name="image" aria-label="Archivo">
            </div>
          </fieldset>

          <fieldset id="pricesField">
            <legend>Prices</legend>
            <label for="priceNum">Precio</label>
            <input type="number" require step="10" min="0" max="10000" value="0" name="priceNum" id="priceNum" />
            <label for="priceTxt">Escribir tipo de entrada tras escoger precio</label>
            <input type="text" require name="priceTxt" id="priceTxt" autocomplete="false" placeholder="ticket title" />
            <button id="addPrice" >Add</button>
            <ul id="priceList"></ul>
          </fieldset>
          

          <fieldset>
            <legend>Location</legend>
            <input type="text" require name="location" id="location" placeholder="Ciudad, Provincia, País" />
          </fieldset>
          
          <fieldset>
            <legend>Date</legend>
            <label for="startDate">Fecha de inicio</label>
            <input type="datetime-local" require name="startDate" id="startDate" />
            <label for="endDate">Fecha de final</label>
            <input type="datetime-local" require name="endDate" id="endDate" />
          </fieldset>

          <fieldset>
            <legend>Description</legend>
            <textarea spellcheck="true" name="description" id="description"  minlength="10" maxlength="350" cols="30" rows="10" placeholder="Description of the event..."></textarea>
          </fieldset>

          <button type="submit" id="createSubmit">Create Event</button>
        </form>
      </section>
    
    `;
};

const selIDvalue = (id) => document.getElementById(`${id}`)?.value;

const selIDfile = (id) => {
  const elem = document.getElementById(`${id}`);
  return elem?.files ? elem?.files[0] : undefined;
};

const newEvent = () => {
  document.querySelector("main").innerHTML = template();

  const listPrices = document.getElementById("priceList");
  const inputTitle = document.getElementById("priceTxt");
  const inputNumPrice = document.getElementById("priceNum");
  if (listPrices) setButtonList(listPrices, inputTitle, inputNumPrice);

  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const now = new Date().toISOString().split(":").slice(0, -1).join(":");
  startDate.value = now;
  startDate.min = now;
  endDate.min = now;

  function resetMinEndDate() {
    endDate.min = this.value;
  }

  startDate.addEventListener("change", resetMinEndDate);
  const submitBtn = document.getElementById("createSubmit");
  if (submitBtn) submitBtn.addEventListener("click", (e) => createSubmit(e));
};

const setButtonList = (list, textInput, numInput) => {
  document.getElementById("addPrice").addEventListener("click", (e) => {
    e.preventDefault();

    const txtValue = textInput.value;
    const numValue = numInput.value;
    if (
      [...list.querySelectorAll("li")]
        .map(({ innerHTML }) => innerHTML.split(":")[0])
        .includes(txtValue)
    )
      return notyfication(
        "error",
        "You can't create two tickets with same title"
      );

    if (txtValue.trim().length && Number(numValue)) {
      list.innerHTML += `
          <li>${txtValue.trim()}: ${Number(
            numValue
          )}€ <button class="removeLi">✖</button></li>
          `;
      textInput.value = "";
      numInput.value = 0;
      document.querySelector(".removeLi").addEventListener("click", (e) => {
        e.target.parentElement.remove();
      });
    } else notyfication("error", "Your ticket must have some price and text");
  });
};

const createSubmit = async (e) => {
  e.preventDefault();

  const date = [selIDvalue("startDate"), selIDvalue("endDate")];
  const prices = [...document.getElementById("priceList").children].map((ch) =>
    ch.textContent.slice(0, -1).replaceAll("€", "").trim().split(": ")
  );

  const bodyPost = {
    title: selIDvalue("title"),
    image: selIDfile("image"),
    location: selIDvalue("location"),
    date,
    description: selIDvalue("description"),
    ticketPrice: prices,
  };

  if (
    !Object.values(bodyPost).some((v) =>
      typeof !Array.isArray(v) ? !v : !v.length || v.some((n) => !n)
    )
  ) {
    callModal("¿Quieres publicar este evento?", handleSubmit, bodyPost);
  } else {
    const lackFields = Object.keys(bodyPost)
      .filter((k) =>
        typeof bodyPost[k] != "object"
          ? !bodyPost[k]
          : !bodyPost[k].length || bodyPost[k].some((n) => !n)
      )
      .join(", ");

    notyfication(
      "error",
      `Tienes que rellenar todos los campos, campos faltantes: [${lackFields}]`
    );
  }
};

export default newEvent;
