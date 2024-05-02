const template = () => `
<section id="myevents">
  <ul id="eventscontainer">
  </ul>
</section>
`;

const getMyEvents = async () => {
  const userId = JSON.parse(localStorage.getItem("user")._id);
  const booksData = await fetch(`http://localhost:3000/api/v1/user/${userId}`);
  const data = await booksData.json();
  const books = data.favs;
  const booksContainer = document.querySelector("#eventscontainer");
  for (const book of books) {
    const li = document.createElement("li");
    li.innerHTML = `
    <img src=${book.front} alt=${book.title} height="300"/>
    <h3>Título: ${book.title}</h3>
    <h4>Autor: ${book.author}</h4>
    <h5>Year: ${book.year}</h5>
    <h5>Editorial: ${book.editorial}</h5>
    <h5>${"⭐".repeat(Math.floor(Number(book.rate)))}</h5>
    <h5>${book.price}€</h5>
    `;
    booksContainer.appendChild(li);
  }
};

const MyEvents = () => {
  document.querySelector("main").innerHTML = template();
  getMyEvents();
};

export default MyEvents;
