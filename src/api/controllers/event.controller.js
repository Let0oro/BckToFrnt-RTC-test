const Event = require("../models/event.model");

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().lean();
    return res.status(200).json({ events });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error getting all events", error: err.message });
  }
};

const getEventsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    return res.status(200).json({ event });
  } catch (err) {
    return res
      .status(200)
      .json({ message: "Error getting event by id", error: err.message });
  }
};

const postEvent = async (req, res, next) => {
  try {
    const { title, editorial, author } = req.body;
    const existedEvent = await Event.findOne({ title });

    if (
      existedEvent &&
      existedEvent.editorial === editorial &&
      existedEvent.author === author
    ) {
      return res.status(400).json({ message: "This events already exists" });
    }

    const newEvent = new Event(req.body);
    const event = await newEvent.save();
    return res.status(201).json({ message: "new event posted:", event });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error creating new event", error: err.message });
  }
};

const updateEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newEvent = new Event(req.body);
    newEvent._id = id;
    console.log(newEvent);

    const eventExist = await Event.findById(id);
    if (!!!eventExist)
      return res
        .status(404)
        .json({ message: `Events with ID:${id} don't exist` });

    const eventUpdated = await Event.findByIdAndUpdate(id, {"attendees": newEvent.attendees}, {
      new: true,
    });
    console.log(eventUpdated);
    return res
      .status(200)
      .json({ message: "event updated", event: eventUpdated });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error updating a event", error: err.message });
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Event deleted succesfully",
      eventDeleted: event,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error deleting a event", error: err.message });
  }
};

module.exports = {
  getEvents,
  getEventsById,
  updateEventById,
  postEvent,
  deleteEvent,
};
