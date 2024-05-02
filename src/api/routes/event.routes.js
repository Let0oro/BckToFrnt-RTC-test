const isAuth = require("../../middlewares/auth.js");

const {
    getEvents,
    getEventsById,
    updateEventById,
    postEvent,
    deleteEvent
} = require("../controllers/event.controller.js");

const eventsRouter = require("express").Router();

eventsRouter.get("/", getEvents);
eventsRouter.get("/:id", getEventsById);
eventsRouter.post("/", isAuth, postEvent);
eventsRouter.put("/add_user/:id", isAuth, updateEventById);
eventsRouter.put("/remove_user/:id", isAuth, updateEventById);
eventsRouter.delete("/:id", isAuth, deleteEvent);

module.exports = eventsRouter;