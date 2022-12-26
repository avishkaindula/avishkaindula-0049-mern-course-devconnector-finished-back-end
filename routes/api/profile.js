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
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    // This if statement will check for invalid user ids on the post request url
    // and throw this error.
    res.status(500).send("Server Error");
  }
});
// http://localhost:5000/api/profile/user/63a5b686e910c0a6a4918f98
// Now when we send a get request like this, it will return the profile data
// of the user with the id 63a5b686e910c0a6a4918f98

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
// This delete request will delete user, profile and posts all at the same time.
router.delete("/", auth, async (req, res) => {
  // This will send a delete request to http://localhost:5000/api/profile/F
  try {
    // @todo - remove users posts

    // Remove profile
    // This will delete a profile from the profiles collection
    // We need to access the Profile.js model and remove it.
    // That's why we've used "Profile." in here
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove user
    // This will delete a user from the profiles collection
    // We need to access the User.js model and remove it.
    // That's why we've used "User." in here
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // user.id will be sent along the put request as a value of the token.

      profile.experience.unshift(newExp);
      // profile.experience is an array. So we can push newExp for that.
      // unshift() is just like push but it pushes at the beginning rather than the end.
      // So that way, the most resent experiences are shown at first.
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    // splice will take out the experience from the profile

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
