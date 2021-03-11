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

app.post("/api/exercise/add", async (req, res) => {
  const { userId, description, duration } = req.body;

  const date = req.body.date === "" ? undefined : new Date(req.body.date);

  try {
    const findUser = await User.findById(userId);

    const exercise = new Exercise({
      userId: findUser._id,
      username: findUser.username,
      description: description,
      duration: duration,
      date: date,
    });

    const savedExercise = await exercise.save();
    const newExercise = {
      username: savedExercise.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date,
      _id: savedExercise.userId,
    };

    return res.status(200).json(newExercise);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).send({ error: "Problems with our server" });
  }
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
