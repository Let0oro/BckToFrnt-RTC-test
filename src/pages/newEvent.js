import { FrontFetch } from "#utils/Front.fetch";

const template = () => {
  return `
      <section>
        <form onkeydown="if(event.keyCode === 13) {alert('You have pressed Enter key, use submit button instead');return false;}" >

          <fieldset>
            <legend>Title</legend>
            <input type="text" require name="title" id="title" placeholder="Título de Evento" />
          </fieldset>
          
          <fieldset>
            <legend>Image</legend>
            <div class="file-select" id="imageDiv" >
                <!-- <input type="url" require name="image" id="image" placeholder="[URL] Portada de Evento" /> -->
                <input type="file" multiple="false" id="image" require accept="image/png, image/jpeg, image/webg, image/png" name="image" aria-label="Archivo">
            </div>
          </fieldset>

          <img src="" alt="Loading" id="imageCharged" />

          <fieldset id="pricesField">
            <legend>Prices</legend>
            <label for="priceNum">Precio</label>
            <input type="number" require step="10" min="0" max="10000" value="0" name="priceNum" id="priceNum" />
            <label for="priceTxt">Escribir tipo de entrada tras escoger precio</label>
            <input type="text" require name="priceTxt" id="priceTxt" autocomplete="false" placeholder="Press SPACE to add" />
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
            <textarea spellcheck="true" name="description" id="description" cols="30" rows="10" placeholder="Description of the event..."></textarea>
          </fieldset>

          <button type="submit" id="createSubmit">Create Event</button>
        </form>
      </section>
    
    `;
};

const selIDvalue = (id) => document.getElementById(`${id}`)?.value;

const selIDfile = (id) => {
  const elem = document.getElementById(`${id}`);
  return elem?.files ? elem?.files[0] : undefined
};

const newEvent = () => {
  document.querySelector("main").innerHTML = template();

  const listPrices = document.getElementById("priceList");
  const inputTitle = document.getElementById("priceTxt");
  const inputNumPrice = document.getElementById("priceNum");
  if (listPrices) setButtonList(listPrices, inputTitle, inputNumPrice);

  const submitBtn = document.getElementById("createSubmit");
  if (submitBtn) submitBtn.addEventListener("click", (e) => createSubmit(e));
};

const setButtonList = (list, textInput, numInput) => {
  [textInput, numInput].forEach((el) => {
    el.addEventListener("keyup", (e) => {
      e.preventDefault();
        
      if (e.key == " " || e.key == "Enter") {
        list.innerHTML += `
            <li>${textInput.value.slice(0, -1)}: ${Number(
              numInput.value
            )}€ <button class="removeLi">✖</button></li>
        `;
        textInput.value = "";
        numInput.value = 0;
        document.querySelector(".removeLi").addEventListener("click", (e) => {
          list.remove(e.target.parentElement);
        });
      }
    });
  });
};

const createSubmit = async (e) => {
  e.preventDefault();

  const date = [selIDvalue("startDate"), selIDvalue("endDate")];
  const prices = [...document.getElementById("priceList").children].map((ch) =>
    ch.textContent.slice(0, -1).replaceAll("€", "").trim().split(": ")
  );

  const bodyPost = {
    title: await selIDvalue("title"),
    image: selIDfile("image"),
    location: await selIDvalue("location"),
    date,
    description: await selIDvalue("description"),
    ticketPrice: prices,
  };

  if (!Object.values(bodyPost).some((v) => !v)) {
    const data = await FrontFetch.caller(
      { name: "events", method: "post" },
      { ...bodyPost }
    );

  } else {
    alert(
      `Tienes que rellenar todos los campos, campos faltantes: [${Object.values(
        bodyPost
      )
        .filter((v) => !v)
        .join(", ")}]`
    );
  }
};

export default newEvent;