const verifyJWT = require("../../middlewares/auth.js");
const isAuth = require("../../middlewares/auth.js");

const {
    getEvents,
    getEventsById,
    getMyEvents,
    updateEventById,
    postEvent,
    deleteEvent,
} = require("../controllers/event.controller.js");

const eventsRouter = require("express").Router();

eventsRouter.get("/", getEvents);
eventsRouter.get("/my_events", getMyEvents);
eventsRouter.get("/:id", getEventsById);
eventsRouter.post("/", verifyJWT, postEvent);
eventsRouter.put("/update/:id/:status", verifyJWT, updateEventById);
eventsRouter.delete("/:id", verifyJWT, deleteEvent);

module.exports = eventsRouter;