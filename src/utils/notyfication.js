import { Notyf } from "notyf";
const notyf = new Notyf({ ripple: false });

let notificationActive = false;

export default (type, message) => {
  if (!type || !message) return;

  if (!notificationActive) {
    notificationActive = true;

    notyf[type](message);

    setTimeout(() => {
      notificationActive = false;
    }, 3000);
  }
};
