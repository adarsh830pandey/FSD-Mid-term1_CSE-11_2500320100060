const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const books = [
  {
    id: 101,
    title: "Java",
    author: "Unknown",
    category: "Programming",
    quantity: 5,
    available: 5,
  },
];

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function parseBookId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function findBook(req, res, next) {
  const id = parseBookId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Book ID must be a positive integer." });
  }

  req.book = books.find((book) => book.id === id);
  if (!req.book) {
    return res.status(404).json({ error: "Book not found." });
  }

  next();
}

function parseQuantity(value, defaultValue = 1) {
  const quantity = value === undefined ? defaultValue : value;
  return isPositiveInteger(quantity) ? quantity : null;
}

app.get("/", (req, res) => {
  res.json({ message: "Library Management System API", status: "running" });
});

app.get("/api/books", (req, res) => {
  res.json(books);
});

app.get("/api/books/:id", findBook, (req, res) => {
  res.json(req.book);
});

app.post("/api/books", (req, res) => {
  const { title, author, category } = req.body;
  const quantity = req.body.quantity;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof author !== "string" ||
    !author.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    !isPositiveInteger(quantity)
  ) {
    return res.status(400).json({
      error: "title, author, and category must be non-empty strings, and quantity must be a positive integer.",
    });
  }

  const id =
    req.body.id === undefined
      ? Math.max(100, ...books.map((book) => book.id)) + 1
      : parseBookId(req.body.id);
  if (id === null) {
    return res.status(400).json({ error: "Book ID must be a positive integer." });
  }
  if (books.some((book) => book.id === id)) {
    return res.status(409).json({ error: "A book with this ID already exists." });
  }

  const book = {
    id,
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    quantity,
    available: quantity,
  };
  books.push(book);
  res.status(201).json(book);
});

app.put("/api/books/:id", findBook, (req, res) => {
  const requiredFields = ["title", "author", "category", "quantity"];
  const fields = Object.keys(req.body);
  if (
    fields.length !== requiredFields.length ||
    requiredFields.some((field) => !fields.includes(field))
  ) {
    return res.status(400).json({
      error: "Provide title, author, category, and quantity to replace the book details.",
    });
  }

  for (const field of ["title", "author", "category"]) {
    if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
      return res.status(400).json({ error: `${field} must be a non-empty string.` });
    }
  }

  if (!isPositiveInteger(req.body.quantity)) {
    return res.status(400).json({ error: "quantity must be a positive integer." });
  }

  const issued = req.book.quantity - req.book.available;
  if (req.body.quantity < issued) {
    return res.status(400).json({
      error: `quantity cannot be less than the ${issued} currently issued copy/copies.`,
    });
  }

  req.book.title = req.body.title.trim();
  req.book.author = req.body.author.trim();
  req.book.category = req.body.category.trim();
  req.book.quantity = req.body.quantity;
  req.book.available = req.body.quantity - issued;

  res.json(req.book);
});

app.delete("/api/books/:id", findBook, (req, res) => {
  if (req.book.available !== req.book.quantity) {
    return res.status(409).json({ error: "Return all issued copies before deleting this book." });
  }

  books.splice(books.indexOf(req.book), 1);
  res.status(204).end();
});

app.post("/api/books/:id/issue", findBook, (req, res) => {
  const quantity = parseQuantity(req.body.quantity);
  if (quantity === null) {
    return res.status(400).json({ error: "quantity must be a positive integer." });
  }
  if (quantity > req.book.available) {
    return res.status(409).json({
      error: `Only ${req.book.available} copy/copies are currently available.`,
    });
  }

  req.book.available -= quantity;
  res.json({ message: "Book issued successfully.", book: req.book, issued: quantity });
});

app.post("/api/books/:id/return", findBook, (req, res) => {
  const quantity = parseQuantity(req.body.quantity);
  if (quantity === null) {
    return res.status(400).json({ error: "quantity must be a positive integer." });
  }
  const issued = req.book.quantity - req.book.available;
  if (quantity > issued) {
    return res.status(409).json({
      error: `Only ${issued} copy/copies have been issued.`,
    });
  }

  req.book.available += quantity;
  res.json({ message: "Book returned successfully.", book: req.book, returned: quantity });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Request body must contain valid JSON." });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Library Management System API listening on http://localhost:${PORT}`);
});
