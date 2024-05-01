const Book = require("../models/book.model");

const getBooks = async (req, res, next) => {
    try {
        const books = await Book.find();
        return res.status(200).json({books});
    } catch(err) {
        return res.status(400).json({message: "Error getting all books", error: err.message})
    }
}

const getBooksById = async (req, res, next) => {
    try {
        const {id} = req.params;
        const book = await Book.findById(id);
        return res.status(200).json({book});
    } catch(err) {
        return res.status(200).json({message: "Error getting book by id", error: err.message})
    }
};

const postBook = async (req, res, next) => {
    try {

        const {title, editorial, author} = req.body;
        const existedBook = await Book.findOne({title});

        if (existedBook && existedBook.editorial === editorial && existedBook.author === author) {
            return res.status(400).json({message: "This books already exists"});
        }

        const newBook = new Book(req.body);
        const book = await newBook.save();
        return res.status(201).json({message:"new book posted:", book});
    } catch (err) {
        return res.status(400).json({message: "Error creating new book", error: err.message});
    };
}; 

const updateBookById = async (req, res, next) => {
    try {
        console.log("UPDATE BOOK FUNCTION")
        const { id } = req.params;
        const newBook = new Book(req.body);
        newBook._id = id;
        const bookUpdated = await Book.findByIdAndUpdate(id, newBook, {
            new: true
        });
        return res.status(200).json({message: "book updated", book: bookUpdated});
    } catch(err) {
        return res.status(400).json({message: "Error updating a book", error: err.message});
    }
};

const deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await Book.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Book deleted succesfully",
            bookDeleted: book,
        });
    } catch (err) {
        return res.status(400).json({message: "Error deleting a book", error: err.message});
    }
};

module.exports = {
    getBooks,
    getBooksById,
    updateBookById,
    postBook,
    deleteBook
};