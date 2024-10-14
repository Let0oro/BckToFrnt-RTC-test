
export default (title, funct, ...functArgs) => {
  const modal = document.querySelector("dialog");
  const modaltitle = document.querySelector("dialog h3");
  const buttonYes = document.querySelector("dialog #confirm");
  const buttonNo = document.querySelector("dialog #close");

  modaltitle.innerHTML =  title;
  modal.showModal();
  buttonYes.addEventListener("click", () => {

    if (functArgs) {console.log({functArgs})};
    if (functArgs) {funct(...functArgs)} else funct();
    modal.close();
  });
  buttonNo.addEventListener("click", () => modal.close());
}