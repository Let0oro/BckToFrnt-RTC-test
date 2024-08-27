const { default: mongoose } = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    ticketPrice: [
      [
        { type: String, required: true, trim: true },
        { type: Number, required: true, trim: true },
      ],
    ],
    image: { type: String, trim: true, required: false },
    location: { type: String, required: true, trim: true },
    date: [
      { type: Date, required: true, trim: true },
      { type: Date, required: false, trim: true },
    ],
    description: { type: String, required: true, trim: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    confirmed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    collection: "events",
  }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
