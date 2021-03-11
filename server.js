require("dotenv").config();
const express = require("express");
const User = require("./model/user");
const Exercise = require("./model/exercise");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", async (req, res) => {
  const { username } = req.body;

  try {
    const isUnique = await User.find({ username: username });
    if (isUnique.length !== 0) {
      return res.status(400).json("User already exist");
    }
    const newUser = new User({
      username: username,
    });
    newUser.save().then((result) => {
      res.status(200).json(result);
    });
  } catch {
    return res.status(500).send({ error: "Problems with our server" });
  }
});

app.post("/api/exercise/add", (req, res) => {
  const { userId, description, duration, date } = req.body;
  res.json({ name: "golololo" });
});

app.get("/api/exercise/users", (req, res) => {
  res.json({ name: "erererer" });
});

app.get("/api/exercise/log", (req, res) => {
  res.json({ name: "as;dklsa;ldkweotijo" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
