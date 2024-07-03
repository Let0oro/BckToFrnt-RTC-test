const jwt = require("jsonwebtoken");
const nodeMail = require("../../utils/nodemailer");
const Event = require("../models/event.model");
const User = require("../models/user.model");
require('dotenv').config({path: '../../../.env'});

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

const getMyEvents = async (req, res, next) => {
  const reqHeadCookies = req.headers?.cookie?.split(';').find(v => v.startsWith("accessToken="))?.split("accessToken=")[1];

  const accesstoken = reqHeadCookies || req.cookies?.accessToken;
  if (!accesstoken) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    const decodedUser = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET);

    const userID = decodedUser._id;

    const userEvents = await User.findById(userID).populate('eventsSaved events');
    
    if (!userEvents) {
      return res.status(404).json({message: "This user don't have events saved or bought"});
    }

    return res.status(200).json({userID,events: userEvents.events, eventsSaved: userEvents.eventsSaved});
  } catch (error) {
    return res.status(400).json({message: error.message});
  }
  }

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
    let { id: eventId, status: action } = req.params;
    const { _id: userId, email, userName } = req.user;
    let objByAction;

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

    const { attendees, confirmed, title, ticketPrice } = eventMod;
    const { eventsSaved } = userMod;
    const existBothId = !!(existsID(attendees, userId) && existsID(events, eventId))

    if (existBothId && action == "add") {
      return res.status(400).json({ message: "User already is an attendee" });
    }

    if (!existBothId && !action == "remove") {
      return res.status(400).json({ message: "User isn't an attendee" });
    }
    
    if (existsID(confirmed, userId) && action == "confirm") {
      return res.status(400).json({ message: "User already is confirmed" });
    }

    objByAction = {
      "add": [...attendees, userId],
      "remove": attendees.filter(id => `${id}` !== `${userId}`)
    }

    eventMod = await Event.findByIdAndUpdate(
      eventId,
      action == "confirm" ? { confirmed: [...confirmed, userId] } : { attendees: objByAction[action] },
      { new: true }
    );

    objByAction = {
      "add": [...eventsSaved, eventId],
      "remove": eventsSaved.filter(id => `${id}` !== `${eventId}`)
    }

    if (action === "confirm") nodeMail(email, userName, title, ticketPrice, (eventId +'-'+ id.splice(id.length-4, 2, '.')));

    if (action != "confirm") {
      userMod = await User.findByIdAndUpdate(
        userId,
        { eventsSaved: objByAction[action] },
        { new: true }
      );
    }

    return res.status(200).json({
      message: `Event and User updated and ${action ? "added" : "removed"}`,
      eventAttendees: attendees,
      userEvents: eventsSaved,
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
  getMyEvents,
  updateEventById,
  postEvent,
  deleteEvent,
};
