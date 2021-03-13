require("dotenv").config();
const express = require("express");
const User = require("./model/user");
const Exercise = require("./model/exercise");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const exercise = require("./model/exercise");

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
      date: savedExercise.date.toDateString(),
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
  User.find({})
    .select("-__v")
    .then((users) => {
      res.json(users);
    });
});

app.get("/api/exercise/log?:userId?:from?:to?:limit", async (req, res) => {
  const id = req.query.userId;
  let from = req.query.from;
  let to = req.query.to;
  let limit = Number(req.query.limit);
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send("Unknown userId");
    }

    const { _id, username } = user;
    const log = await Exercise.find({ userId: _id });

    let limitedExercise = [];
    from = new Date(from);
    to = new Date(to);
    if (
      from.toString() !== "Invalid Date" &&
      to.toString() !== "Invalid Date"
    ) {
      log.forEach((exercise) => {
        if (exercise.date > from && exercise.date < to) {
          limitedExercise.push(exercise);
        }
      });
    } else if (
      from.toString() !== "Invalid Date" &&
      to.toString() === "Invalid Date"
    ) {
      log.forEach((exercise) => {
        if (exercise.date > from) {
          limitedExercise.push(exercise);
        }
      });
    } else if (
      from.toString() === "Invalid Date" &&
      to.toString() !== "Invalid Date"
    ) {
      log.forEach((exercise) => {
        if (exercise.date < to) {
          limitedExercise.push(exercise);
        }
      });
    } else {
      limitedExercise = log;
    }

    if (!limit) {
      limit = limitedExercise.length;
    }

    const updateLimitedExercise = limitedExercise.splice(0, limit);

    const newLog = [];

    updateLimitedExercise.forEach(({ duration, date, description }) => {
      const exerciseUpdate = {
        description,
        duration,
        date: date.toDateString(),
      };
      newLog.push(exerciseUpdate);
    });

    const count = updateLimitedExercise.length;

    const userLog = {
      _id: user.id,
      username: user.username,
      count: count,
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
