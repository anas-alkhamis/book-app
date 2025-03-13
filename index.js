const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Dummy data for books and users
const books = [
    { isbn: "12345", title: "Book One", author: "Author One", reviews: [] },
    { isbn: "67890", title: "Book Two", author: "Author Two", reviews: [] }
];

const users = [];
const secretKey = "your_secret_key";

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// Task 1: Get all books
app.get("/books", (req, res) => {
    res.json(books);
});

// Task 2: Get book by ISBN
app.get("/books/isbn/:isbn", (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    book ? res.json(book) : res.status(404).json({ message: "Book not found" });
});

// Task 3: Get books by author
app.get("/books/author/:author", (req, res) => {
    const filteredBooks = books.filter(b => b.author === req.params.author);
    res.json(filteredBooks);
});

// Task 4: Get books by title
app.get("/books/title/:title", (req, res) => {
    const filteredBooks = books.filter(b => b.title.includes(req.params.title));
    res.json(filteredBooks);
});

// Task 5: Get book reviews
app.get("/books/reviews/:isbn", (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    book ? res.json(book.reviews) : res.status(404).json({ message: "Book not found" });
});

// Task 6: Register new user
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }
    users.push({ username, password });
    res.json({ message: "User registered successfully" });
});

// Task 7: Login as registered user
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username }, secretKey);
    res.json({ token });
});

// Task 8: Add/Modify book review (Authenticated users only)
app.post("/books/reviews/:isbn", authenticateToken, (req, res) => {
    const { review } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.reviews.push({ username: req.user.username, review });
    res.json({ message: "Review added" });
});

// Task 9: Delete user's own review
app.delete("/books/reviews/:isbn", authenticateToken, (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.reviews = book.reviews.filter(r => r.username !== req.user.username);
    res.json({ message: "Review deleted" });
});

// Task 10: Get all books using async callback
app.get("/async-books", async (req, res) => {
    setTimeout(() => res.json(books), 1000);
});

// Task 11-13: Fetch books using Axios (Simulated API calls)
app.get("/fetch-books", async (req, res) => {
    try {
        const response = await axios.get("https://api.example.com/books");
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 14: Submission link
app.get("/submission", (req, res) => {
    res.json({ message: "Submit your project GitHub link here." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
