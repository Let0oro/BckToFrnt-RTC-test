const callModal = async (title, funct, ...functArgs) => {
  const modal = document.querySelector("dialog");
  const modaltitle = document.querySelector("dialog h3");
  const buttonYes = document.querySelector("dialog #confirm");
  const buttonNo = document.querySelector("dialog #close");

  modaltitle.innerHTML = title;
  modal.showModal();

  async function handleModalConfirm(e) {
    e.preventDefault();

    if (functArgs && functArgs.length > 0) {
      await funct(...functArgs);
    } else {
      await funct();
    }

    modal.close();
  }

  buttonYes.removeEventListener("click", handleModalConfirm);
  buttonYes.addEventListener("click", handleModalConfirm);

  buttonNo.addEventListener("click", () => modal.close());
};

export default callModal;
