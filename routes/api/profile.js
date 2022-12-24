const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

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

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Public
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    // We're gonna pull all this stuff out from the request body.
    // But we need to make sure this field are added before send them to
    // the database. We can use if checks in below for that.

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    // This user.id will be extracted from the jwt web token sent along this post request.
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
      // This .split() convert the string to an array
      // It take in a delimiter which is gonna be a ","
      // This will split the skills separated by commas and add them as
      // separate array values.
    }

    // console.log(profileFields.skills);
    // JSON data sent => { "skills": "NodeJS, React,Flutter" }
    // console output => [ 'NodeJS', 'React', 'Flutter' ]

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // Update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // This will update the existing profile data of a user.
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      // This will create a new instance of Profile.
      await profile.save();
      // This will save the user profile data to the database.
      res.json(profile);
    } catch {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
