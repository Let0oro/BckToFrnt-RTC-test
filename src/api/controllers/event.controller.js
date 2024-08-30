const jwt = require("jsonwebtoken");
const nodeMail = require("../../utils/nodemailer");
const Event = require("../models/event.model");
const User = require("../models/user.model");
const { deleteImgCloudinary } = require("../../middlewares/files.middleware");
require("dotenv").config({ path: "../../../.env" });

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
  const reqHeadCookies = req.headers?.cookie
    ?.split(";")
    .find((v) => v.startsWith("accessToken="))
    ?.split("accessToken=")[1];

  const accesstoken = reqHeadCookies || req.cookies?.accessToken;
  if (!accesstoken) {
    return res
      .status(401)
      .json({ message: "No se proporcionó token de autenticación" });
  }

  try {
    const decodedUser = jwt.verify(
      accesstoken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const userID = decodedUser._id;

    const { eventsSaved: userEventsSaved } = await User.findById(userID)
      .populate({
        path: "eventsSaved",
        model: Event,
        // select: {
        //   _id: false,
        // },
      })
      .select("eventsSaved")
      .lean();
    const { events: userEventsPurchased } = await User.findById(userID)
      .populate({
        path: "events._id",
        model: Event,
        // select: "-_id",
      })
      .select("events")
      .lean();

    if (!userEventsPurchased || !userEventsSaved) {
      return res
        .status(404)
        .json({ message: "This user don't have events saved or bought" });
    }

    return res.status(200).json({
      userID,
      events: userEventsPurchased,
      eventsSaved: userEventsSaved,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const postEvent = async (req, res, next) => {
  try {
    const { title, date, ticketPrice } = req.body;
    const existedEvent = await Event.findOne({ title });

    if (existedEvent && existedEvent?.image === req?.file?.path || title == existedEvent?.title) {
      return res.status(400).json({ message: "This event already exists" });
    }

    const newEvent = new Event({
      ...req.body,
      image: req.file ? req.file?.path : "no image",
      date: JSON.parse(date),
      ticketPrice: JSON.parse(ticketPrice),
    });
    const event = await newEvent.save();
    return res.status(201).json({ message: "new event posted:", event });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error creating new event " + err.message });
  }
};

const updateEventById = async (req, res, next) => {
  const { id: eventId, status: action } = req.params;
  const { _id: userId, email, userName } = req.user;
  const { selectedTitle, selectedPrice } = req.body;

  try {
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

    const { attendees, confirmed } =
      eventMod;

    const { eventsSaved, events, email } = userMod;
    const existBothId = !!(
      existsID(attendees, userId) && existsID(eventsSaved, eventId)
    );

    if (existBothId && action == "save") {
      return res.status(400).json({ message: "User already is an attendee" });
    }

    if (!existBothId && !action == "unsave") {
      return res.status(400).json({ message: "User isn't an attendee" });
    }

    if (existsID(confirmed, userId) && action == "confirm") {
      return res.status(400).json({ message: "User already is confirmed" });
    }

    if (!existsID(confirmed, userId) && action == "remove") {
      return res.status(400).json({ message: "User isn't an confirmed" });
    }

    console.log("confirmed", confirmed);

    objByAction = {
      save: { $addToSet: { attendees: [...attendees, userId] } },
      unsave: { attendees: attendees.filter((id) => `${id}` !== `${userId}`) },
      remove: { confirmed: confirmed.filter((id) => `${id}` !== `${userId}`) },
      confirm: { $addToSet: { confirmed: [...confirmed, userId] } },
    };

    await Event.findByIdAndUpdate(eventId, objByAction[action], { new: true });

    const newEventPurchased = new Event({
      _id: eventId,
      ticketPriceSelected: [selectedTitle, Number(selectedPrice)],
    });

    objByAction = {
      save: { $addToSet: { eventsSaved: eventId } },
      unsave: {
        eventsSaved: eventsSaved.filter((id) => `${id}` !== `${eventId}`),
      },
      confirm: { $addToSet: { events: newEventPurchased } },
      remove: {
        events: events.filter(({ _id }) => `${_id}` !== `${eventId}}`),
      },
    };

    // if (action === "confirm")
    //   nodeMail(
    //     email,
    //     userName,
    //     title,
    //     ticketPrice,
    //     [selectedTitle, Number(selectedPrice)],
    //     eventId + "-" + userId.splice(userId.length - 4, 2, ".")
    //   );

    await User.findByIdAndUpdate(userId, objByAction[action], { new: true });

    return res.status(200).json({
      message: `Event and User updated and ${action}${
        action.at(-1) == "e" ? "" : "e"
      }d`,
      eventAttendees: attendees,
      userEvents: eventsSaved,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error updating an event", error: err.message });
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id)
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({message: "this event does't exist"})
    if (event.image != "no image") deleteImgCloudinary(event.image);
    await Event.findOneAndDelete(event)
    return res.status(200).json({
      message: "Event deleted succesfully",
      eventDeleted: event,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error deleting a event " + String(err.message) });
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
