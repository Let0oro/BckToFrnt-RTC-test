const { verifyJWT } = require("../../middlewares/auth.js");
const { eventUpload } = require("../../middlewares/files.middleware.js");

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
eventsRouter.post("/", [verifyJWT, eventUpload.single("image")], postEvent);
eventsRouter.put("/update/:id/:status", [verifyJWT, eventUpload.single("image")], updateEventById);
eventsRouter.delete("/:id", verifyJWT, deleteEvent);

module.exports = eventsRouter;