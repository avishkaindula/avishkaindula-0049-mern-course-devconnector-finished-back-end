const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile
// @desc    Test route
// @access  Public
// router.get("/", (req, res) => res.send("Profile route"));

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    // This user: here is user: { type: mongoose.Schema.Types.ObjectId, ref: "user", },
    // on Profile.js model file. The req.user.id is coming alongside with the token
    // attached to the headers of the get request to this route.
    // "user" on .populate("user") is the user model we created on User.js file.
    // It will add both name and the avatar fields to the const profile to.

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user." });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
