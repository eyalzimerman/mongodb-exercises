require("dotenv").config();
const express = require("express");
const User = require("./model/user");
const Exercise = require("./model/exercise");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
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
      _id: formatDate(savedExercise.userId),
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
  User.find({})
    .select("-__v")
    .then((users) => {
      res.json(users);
    });
});

app.get("/api/exercise/log?:userId?:from?:to?:limit", async (req, res) => {
  const id = req.query.userId;
  const limit = Number(req.query.limit);
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send("Unknown userId");
    }

    const { _id, username } = user;
    const log = await Exercise.find({ userId: _id })
      .limit(limit)
      .select("-userId -__v -username -_id");

    const newLog = [];

    log.forEach(({ duration, date, description }) => {
      const exerciseUpdate = {
        description,
        duration,
        date: formatDate(date),
      };
      newLog.push(exerciseUpdate);
    });

    const count = log.length;

    const userLog = {
      _id,
      username,
      count,
      log: newLog,
    };
    return res.status(200).json(userLog);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).send({ error: "Problems with our server" });
  }
});

function formatDate(date) {
  const year = date.getFullYear();
  const day = date.getDay();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    date
  );
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    date
  );
  return `${weekday} ${month} ${day} ${year}`;
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
