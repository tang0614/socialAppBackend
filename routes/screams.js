const express = require("express");
const router = express("Router");
const Joi = require("joi");
const Scream = require("../model/screamsdb");
const Genre = require("../model/genresdb");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const schema = Joi.object({
  body: Joi.string().min(3).max(1000).required(),
  genreId: Joi.string(),
});

//get all screams
router.get("/", async (req, res) => {
  const screams = await Scream.find().select("-_id");

  if (!screams) {
    //must return otherwise the following code will be executes
    return res.status(404).send({ message: "no screams posted" });
  }

  res.send(screams);
});

//get one scream
router.get("/:_id", async (req, res) => {
  const scream = await Scream.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params._id),
      },
    },
    {
      $lookup: {
        from: "screams", //collection name not model variable name
        localField: "commentOn",
        foreignField: "_id",
        as: "commentOn_details",
      },
    },
    {
      $lookup: {
        from: "screams", //collection name not model variable name
        localField: "comments",
        foreignField: "_id",
        as: "comments_details",
      },
    },
  ]);

  //check if the documents exists
  // const scream = await Scream.findById(req.params._id).select("-_id");

  if (!scream) {
    //must return otherwise the following code will be executes
    return res
      .status(404)
      .send({ message: "the scream of the given id is not found" });
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
    authorName: req.user.handle,
    createdAt: new Date().toISOString(),
    body: req.body.body,
  });

  await scream.save();

  // return scream
  res.send(scream);
});

//comment a existing scream
router.put("/comment/:_id/:comment_id", auth, async (req, res) => {
  const comment = await Scream.findByIdAndUpdate(
    req.params.comment_id,
    {
      $set: { commentOn: req.params._id },
    },
    { new: true }
  );

  if (!comment) {
    //must return otherwise the following code will be executes
    return res
      .status(404)
      .send({ message: "the comment of the given id is not found" });
  }

  const updatedScream = await Scream.findByIdAndUpdate(
    req.params._id,
    {
      $push: {
        comments: {
          _id: req.params.comment_id,
        },
      },

      // $set: { comments: [req.params.comment_id] },
    },
    { new: true }
  );

  if (!updatedScream)
    return res
      .status(404)
      .send({ message: "The genre with the given ID was not provides" });

  // return updated comment
  res.send(comment);
});

//like a scream
// router.put("/like/:_id", auth, async (req, res) => {
//   const updatedScream = await Scream.findByIdAndUpdate(
//     req.params._id,
//     {
//       $push: {
//         likeBy: {
//           _id: req.user._id,
//         },
//       },
//     },
//     { new: true }
//   );

//   if (!updatedScream)
//     return res
//       .status(404)
//       .send({ message: "The genre with the given ID was not provides" });

//   // return scream
//   res.send(updatedScream);
// });

//unlike a scream
// router.put("/unlike/:_id", auth, async (req, res) => {
//   const updatedScream = await Scream.update(
//     { _id: req.params._id },
//     {
//       $pull: {
//         likeBy: {
//           _id: req.user._id,
//         },
//       },
//       function(err, data) {
//         if (err) {
//           return res.status(500).json({ error: "error in deleting users" });
//         }
//       },
//     },

//     { new: true }
//   );

//   if (!updatedScream)
//     return res
//       .status(404)
//       .send({ message: "The genre with the given ID was not provides" });

//   // return scream
//   res.send(updatedScream);
// });

//update a scream genre
router.put("/genre/:_id", auth, async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);

  if (req.body.genreId && !genre)
    return res.status(404).send("The genre with the given ID was not valid");

  const updated = await Scream.findByIdAndUpdate(
    req.params._id,
    {
      $set: {
        genre: {
          _id: genre._id,
          name: genre.name,
        },
      },
    },
    { new: true }
  );

  if (!updated)
    return res
      .status(404)
      .send("The scream with the given ID was not provides");

  // return updated scream
  res.send(updated);
});

//delete a scream
router.delete("/:_id", [auth], async (req, res) => {
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
