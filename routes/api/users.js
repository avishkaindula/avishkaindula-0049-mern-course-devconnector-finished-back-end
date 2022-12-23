const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");

// const { check, validationResult } = require("express-validator/check");
// This throws a warning telling
// requires to express-validator/check are deprecated.You should just use require("express-validator") instead.
// So I need to change the code
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // console.log(req.body);
      // In order to use this, we need to add app.use(express.json({ extended: false })); to server.js

      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // This will cerate a instance of a user.
      // This doesn't save the user, it just creates a new instance
      // We need to call User.save() to save a user.

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      // In the front-end when the user registers we wanna get him logged in right away
      // so in order to get logged in we need to have that token
      // res.send("User registered");
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
          // This will send the jwt token as the json response
          // This token includes the user.id we defined on the payload.
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
