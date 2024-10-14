import { Notyf } from "notyf";
const notyf = new Notyf({ripple: false});

export default (type, message) => {
  notyf[type](message);
};
