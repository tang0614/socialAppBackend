const express = require("express");
const router = express("Router");
const Joi = require("joi");
const Scream = require("../model/screamsdb");
// const Genre = require("../model/genresdb");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const schema = Joi.object({
  body: Joi.string().min(3).max(1000).required(),
  genreId: Joi.string(),
});

//get all screams
router.get("/", async (req, res) => {
  // const screams = await Scream.find().sort({ createdAt: -1 });

  const screams = await Scream.aggregate([
    {
      $lookup: {
        from: "users", //collection name not model variable name
        localField: "author",
        foreignField: "_id",
        as: "author_details",
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  if (!screams) {
    //must return otherwise the following code will be executes
    return res.status(404).send({ message: "no screams posted" });
  }

  res.send({ screams });
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
    {
      $lookup: {
        from: "screams", //collection name not model variable name
        localField: "retweetOn",
        foreignField: "_id",
        as: "retweetOn_details",
      },
    },
    {
      $lookup: {
        from: "screams", //collection name not model variable name
        localField: "retweets",
        foreignField: "_id",
        as: "retweets_details",
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

  res.send({ scream });
});

//get all comments from a scream
//get a user likes this scream

//post a new scream
router.post("/", auth, async (req, res) => {
  // check if body is valid
  // if not valid, return 400
  const validateResult = schema.validate(req.body);
  if (validateResult.error) {
    return res
      .status(404)
      .send({ message: validateResult.error.details[0].message });
  }

  const scream = new Scream({
    author: req.user._id,
    createdAt: new Date().toISOString(),
    body: req.body.body,
  });

  await scream.save();

  // return scream
  res.send({ scream });
});

//comment a existing scream
router.put("/comment", auth, async (req, res) => {
  const comment_id = req.body.comment_id;
  const commented_id = req.body.commented_id;

  const comment = await Scream.findByIdAndUpdate(
    comment_id,
    {
      $set: { commentOn: commented_id },
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
    commented_id,
    {
      $push: {
        comments: {
          _id: comment_id,
        },
      },
    },
    { new: true }
  );

  if (!updatedScream)
    return res
      .status(404)
      .send({ message: "The comment with the given ID was not provides" });

  // return updated comment
  res.send({ comment });
});

router.put("/uncomment", auth, async (req, res) => {
  const scream = await Scream.findById(req.body.comment_id);
  const target = await Scream.findById(req.body.commented_id);
  if (!target)
    return res
      .status(404)
      .send("The commented with the given ID was not valid");

  if (!scream)
    return res.status(404).send("The comment with the given ID was not valid");

  target.comments.pull({ _id: req.body.comment_id });
  target.save();

  if (!target)
    return res
      .status(404)
      .send("The scream with the given ID was not provides");

  // return updated Section
  res.send({ target });
});

//retweet a existing scream
router.put("/retweet", auth, async (req, res) => {
  const retweet_id = req.body.retweet_id;
  const retweeted_id = req.body.retweeted_id;

  const retweet = await Scream.findByIdAndUpdate(
    retweet_id,
    {
      $set: { retweetOn: retweeted_id },
    },
    { new: true }
  );

  if (!retweet) {
    //must return otherwise the following code will be executes
    return res
      .status(404)
      .send({ message: "the retweet of the given id is not found" });
  }

  const updatedScream = await Scream.findByIdAndUpdate(
    retweeted_id,
    {
      $push: {
        retweets: {
          _id: retweet_id,
        },
      },
    },
    { new: true }
  );

  if (!updatedScream)
    return res
      .status(404)
      .send({ message: "The retweet with the given ID was not provides" });

  // return updated comment
  res.send({ retweet });
});

//update a scream genre
// router.put("/genre/:_id", auth, async (req, res) => {
//   const genre = await Genre.findById(req.body.genreId);

//   if (req.body.genreId && !genre)
//     return res
//       .status(404)
//       .send({ message: "The genre with the given ID was not valid" });

//   const updated = await Scream.findByIdAndUpdate(
//     req.params._id,
//     {
//       $set: {
//         genre: {
//           _id: genre._id,
//           name: genre.name,
//         },
//       },
//     },
//     { new: true }
//   );

//   if (!updated)
//     return res
//       .status(404)
//       .send({ message: "The scream with the given ID was not provides" });

//   // return updated scream
//   res.send({ updated });
// });

//delete a scream
router.put("/delete", [auth], async (req, res) => {
  const comment_ids = req.body.ids;
  console.log("req.body is", req.body);
  let new_ids = [];

  comment_ids.forEach((id) => {
    new_ids.push(new mongoose.Types.ObjectId(id));
  });

  Scream.deleteMany(
    {
      _id: {
        $in: new_ids,
      },
    },
    function (err, result) {
      if (err) {
        res.send({ message: err });
      } else {
        res.send(result);
      }
    }
  );
});

module.exports = router;
