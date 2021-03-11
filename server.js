require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  const { username } = req.body;

  res.json({ name: "fuckall" });
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
