const isAuth = require("../../middlewares/auth");

const {
    getBooks,
    getBooksById,
    updateBookById,
    postBook,
    deleteBook
} = require("../controllers/book.controller.js");

const booksRouter = require("express").Router();

booksRouter.get("/", getBooks);
booksRouter.get("/:id", getBooksById);
booksRouter.post("/", isAuth, postBook);
booksRouter.put("/:id", isAuth, updateBookById);
booksRouter.delete("/:id", isAuth, deleteBook);

module.exports = booksRouter;