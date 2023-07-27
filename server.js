if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const Document = require("./models/Document");

// Connect to the MongoDB database
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost/wastebin";
mongoose.connect(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => {
  console.log("Connected to Mongoose");

  // Define routes and handlers
  app.get("/", (req, res) => {
    const code = `Welcome to WasteBin!

Use the commands in the top right corner
to create a new file to share with others.`;

    res.render("code-display", { code, language: "plaintext" });
  });

  app.get("/new", (req, res) => {
    res.render("new");
  });

  app.post("/save", async (req, res) => {
    const value = req.body.value;
    try {
      const document = await Document.create({ value });
      res.redirect(`/${document.id}`);
    } catch (e) {
      res.render("new", { value });
    }
  });

  app.get("/:id/duplicate", async (req, res) => {
    const id = req.params.id;
    try {
      const document = await Document.findById(id);
      res.render("new", { value: document.value });
    } catch (e) {
      res.redirect(`/${id}`);
    }
  });

  app.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const document = await Document.findById(id);
      res.render("code-display", { code: document.value, id });
    } catch (e) {
      res.redirect("/");
    }
  });

  // Start the server after the MongoDB connection is established
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
