const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,

      // useCreateIndex: true,
      // This will throw an error
      // option usecreateindex is not supported
      // It's better not to use this. This was added because in the course, it threw an
      // error that i didn't get because we didn't add this rule. As I didn't get that
      // error, I don't have to add this rule.
    });

    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    // Exit process with failure
  }
};

module.exports = connectDB;
