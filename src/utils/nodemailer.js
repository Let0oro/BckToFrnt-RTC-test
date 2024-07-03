const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'garret21@ethereal.email',
        pass: 'd9aXTrT4uEA8jrjru2'
    }
});

const message = (name, eventName, price, id) => ({
  from: `"Garret Tromp" <garret21@ethereal.email>`,
  subject: "Asunto del correo electrónico",
  text: "Cuerpo del mensaje de correo electrónico",
  html: `
  <h2>Dear ${name}</h2>
  <p>This is your codeKey of your ticket:</p>
  <p>${eventName} - <em>${id}</em></p>
  <p>Price: <span>${price}</span></p>
  `,
});

async function nodeMail(address, name, eventName, price, id) {
  console.log('NODEMAILER INICIATED');
  address = 'isac.cole@ethereal.email'

  const info = await transporter.sendMail(
    { ...message(name, eventName, price, id), to: address },
    function (err, info) {
      if (err) {
        console.log("Error al enviar el correo electrónico:", err);
      } else {
        console.log("Message sent: %s", info.messageId);
      }
    }
  );
}

module.exports = nodeMail;
