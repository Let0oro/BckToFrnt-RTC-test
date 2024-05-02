const { default: mongoose } = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ticketPrice: [
      [
        { type: String, required: true },
        { type: Number, required: true },
      ],
    ],
    image: { type: String, required: true },
    location: { type: String, required: true },
    date: [
      { type: Date, required: true },
      { type: Date, required: false },
    ],
    description: { type: String, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    confirmed: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true,
    collection: "events",
  }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
