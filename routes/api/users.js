const express = require("express");
const router = express.Router();

// @route   GET api/users   => This is the request type and the endpoint of this api
// @desc    Test route      => This is the description of what the router does
// @access  Public          => This tells whether we need to be authenticated or not in order to use this route.
router.get("/", (req, res) => res.send("User route"));
// We actually send a request to /api/users/ here.
// the /api/users part is defined in app.use("/api/users") in server.js

module.exports = router;
