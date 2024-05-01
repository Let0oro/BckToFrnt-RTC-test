const { default: mongoose } = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    front: { type: String, required: true },
    rate: { type: Number, required: true },
    author: { type: String, required: false },
    editorial: {type: String, required: true },
    year: {type: Number, required: false }
  },
  {
    timestamps: true,
    collection: "books",
  }
);

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;