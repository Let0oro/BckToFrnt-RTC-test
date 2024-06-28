const Event = require("../models/event.model");
const User = require("../models/user.model");

const existsID = (arr, id) => !!arr.some((i) => String(i) == String(id));

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
    let { id: eventId, status: shouldAdd } = req.params;
    const { _id: userId } = req.user;
    console.log(shouldAdd);
    // shouldAdd = !!(Number(shouldAdd));
    let objByStatus;

    let userMod = await User.findById(userId).lean();
    let eventMod = await Event.findById(eventId).lean();

    if (!userMod || !eventMod) {
      return res.status(404).json({
        message: `${
          !userMod
            ? "User doesn't exist"
            : `Events with ID:${eventId} don't exist`
        }`,
      });
    }

    const { attendees, confirmed } = eventMod;
    const { events } = userMod;
    const existBothId = !!(existsID(attendees, userId) && existsID(events, eventId))

    if (existBothId && shouldAdd == "add") {
      return res.status(400).json({ message: "User already is an attendee" });
    }

    if (!existBothId && !shouldAdd == "remove") {
      return res.status(400).json({ message: "User isn't an attendee" });
    }
    
    if (existsID(confirmed, userId) && shouldAdd == "confirm") {
      return res.status(400).json({ message: "User already is confirmed" });
    }

    objByStatus = {
      "add": [...attendees, userId],
      "remove": attendees.filter(id => `${id}` !== `${userId}`)
    }

    eventMod = await Event.findByIdAndUpdate(
      eventId,
      shouldAdd == "confirm" ? { confirmed: [...confirmed, userId] } : { attendees: objByStatus[shouldAdd] },
      { new: true }
    );

    objByStatus = {
      "add": [...events, eventId],
      "remove": events.filter(id => `${id}` !== `${eventId}`)
    }

    if (shouldAdd != "confirm") {
      userMod = await User.findByIdAndUpdate(
        userId,
        { events: objByStatus[shouldAdd] },
        { new: true }
      );
    }

    return res.status(200).json({
      message: `Event and User updated and ${shouldAdd ? "added" : "removed"}`,
      eventAttendees: attendees,
      userEvents: events,
    });
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
