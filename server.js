const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();
// Connecting to the database

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sever started on port ${PORT}`));
