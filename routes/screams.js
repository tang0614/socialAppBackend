const express = require("express");
const router = express("Router");
const Joi = require("joi");
const Scream = require("../model/screamsdb");
const Genre = require("../model/genresdb");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const schema = Joi.object({
  body: Joi.string().min(3).max(30).required(),
  genreId: Joi.string(),
});

//get all screams
router.get("/", async (req, res) => {
  const screams = await Scream.find()
    .populate("author", "handle -_id")
    .select("-_id");

  res.send(screams);
});

//get one scream
router.get("/:_id", async (req, res) => {
  //check if the documents exists
  const scream = await Scream.findById(req.params._id)
    .populate("author", "handle -_id")
    .select("-_id");

  if (!scream) {
    //must return otherwise the following code will be executes
    return res.status(404).send("the scream of the given id is not found");
  }

  res.send(scream);
});

//get all comments from a scream
//get a user likes this scream

//post a new scream
router.post("/", auth, async (req, res) => {
  // check if body is valid
  // if not valid, return 400
  const validateResult = schema.validate(req.body);
  if (validateResult.error) {
    res.status(404).send(validateResult.error.details[0].message);
  }

  const scream = new Scream({
    author: req.user._id,
    body: req.body.body,
  });

  await scream.save();

  // return scream
  res.send(scream);
});

//comment a existing scream
router.put("/:_id/:comment_id/comment", auth, async (req, res) => {
  const comment = await Scream.findById(req.params.comment_id);
  if (!comment) {
    //must return otherwise the following code will be executes
    return res.status(404).send("the comment of the given id is not found");
  }

  const updatedScream = await Scream.findByIdAndUpdate(req.params._id, {
    $set: { comments: [req.params.comment_id] },
  });

  if (!updatedScream)
    return res.status(404).send("The genre with the given ID was not provides");

  // return updated scream
  res.send(updatedScream);
});

//like a scream
router.put("/:_id/like", auth, async (req, res) => {
  const updatedScream = await Scream.findByIdAndUpdate(req.params._id, {
    $set: { likeBy: [req.user._id] },
  });

  if (!updatedScream)
    return res.status(404).send("The genre with the given ID was not provides");

  // return scream
  res.send(updatedScream);
});

//unlike a scream
router.put("/:_id/unlike", auth, async (req, res) => {
  const updatedScream = await Scream.findByIdAndUpdate(req.params._id, {
    $unset: { likeBy: [req.user._id] },
  });

  if (!updatedScream)
    return res.status(404).send("The genre with the given ID was not provides");

  // return scream
  res.send(updatedScream);
});

//update a scream genre
router.put("/:_id", auth, async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);

  if (req.body.genreId && !genre)
    return res.status(404).send("The genre with the given ID was not valid");

  const updated = await Scream.findByIdAndUpdate(req.params._id, {
    $set: {
      genre: {
        _id: genre._id,
        name: genre.name,
      },
    },
  });

  if (!updated)
    return res
      .status(404)
      .send("The scream with the given ID was not provides");

  // return updated scream
  res.send(updated);
});

//delete a scream
router.delete("/:_id", [auth, admin], async (req, res) => {
  try {
    const scream = await Scream.findByIdAndRemove(req.params._id);
    if (!scream) {
      //must return otherwise the following code will be executes
      return res.status(404).send("the scream of the given id is not found");
    } else {
      return res.send(scream);
    }
  } catch (err) {
    return res.status(404).send({ message: err });
  }
});

module.exports = router;
