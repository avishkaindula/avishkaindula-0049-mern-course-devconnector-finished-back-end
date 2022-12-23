const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

// @route   GET api/users   => This is the request type and the endpoint of this api
// @desc    Test route      => This is the description of what the router does
// @access  Public          => This tells whether we need to be authenticated or not in order to use this route.
// router.get("/", (req, res) => res.send("User route"));
// We actually send a request to /api/users/ here.
// the /api/users part is defined in app.use("/api/users") in server.js

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // In order to use this, we need to add app.use(express.json({ extended: false })); to server.js
    res.send("User route");
  }
);

module.exports = router;
