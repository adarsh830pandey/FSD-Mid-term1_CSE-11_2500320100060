# Library Management System

## Student Details

- **Student Name:** [Enter your name]
- **Roll No.:** 2500320100060
- **Branch:** CSE
- **Section:** 11

## Project

A simple REST API for managing library books. It supports adding, viewing, updating, and deleting books, as well as issuing and returning copies. Data is stored in memory and resets whenever the server restarts.

## Technologies Used

- Node.js
- Express.js
- JavaScript
- JSON over HTTP

## Initial Book Data

The server starts with this book:

```json
{
  "id": 101,
  "title": "Java",
  "author": "Unknown",
  "category": "Programming",
  "quantity": 5,
  "available": 5
}
```

`available` is maintained by the API when copies are issued or returned.

## Installation and Run

1. Install Node.js (LTS).
2. Open a terminal in the project folder.
3. Install dependencies:

   ```sh
   npm install
   ```

4. Start the server:

   ```sh
   npm start
   ```

The server listens on **port 3000** at `http://localhost:3000`. Visit the root URL to check that it is running.

## Data Structures Implemented

- An in-memory array of book objects.
- Each book object contains `id`, `title`, `author`, `category`, `quantity`, and `available`.
- The difference between `quantity` and `available` represents the number of copies currently issued.

## API Endpoints

All endpoints use the base URL `http://localhost:3000`. Send and receive JSON unless noted otherwise.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check server status |
| `GET` | `/api/books` | List all books |
| `GET` | `/api/books/:id` | Get a book by ID |
| `POST` | `/api/books` | Add a book |
| `PUT` | `/api/books/:id` | Replace a book's title, author, category, and quantity |
| `DELETE` | `/api/books/:id` | Delete a book if no copies are issued |
| `POST` | `/api/books/:id/issue` | Issue one or more available copies |
| `POST` | `/api/books/:id/return` | Return one or more issued copies |

### Add a book

`POST /api/books` requires title, author, category, and a positive integer quantity. The API assigns the next available ID unless a unique positive integer `id` is supplied. New copies are initially all available.

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "quantity": 3
}
```

### Update a book

`PUT /api/books/101` replaces the book details. Send all of `title`, `author`, `category`, and `quantity`. The API controls `available`, preserves the copies already issued, and rejects a new quantity below the number currently issued.

```json
{
  "title": "Java: The Complete Reference",
  "author": "Herbert Schildt",
  "category": "Programming",
  "quantity": 6
}
```

### Issue and return copies

The request body may specify a positive integer `quantity`; if omitted, one copy is processed.

```json
{ "quantity": 1 }
```

Use the body with either `POST /api/books/101/issue` or `POST /api/books/101/return`. The API rejects issuing more copies than are available and returning more copies than have been issued.

### Error responses

Errors are returned as JSON with an `error` message. Common status codes are `400` for invalid input, `404` for an unknown book or endpoint, and `409` for conflicts such as duplicate IDs or insufficient available copies.