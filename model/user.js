require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);