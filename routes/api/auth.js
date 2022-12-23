const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public
// router.get("/", auth, (req, res) => res.send("Auth route"));
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    // this req.user is what we created in auth.js middleware folder.
    // There's a .id filed in the user: payload we cerated on the auth.js middleware.
    // So we can access it like this : req.user.id
    // -password will leave out the password from the data we getting here from the database.
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
