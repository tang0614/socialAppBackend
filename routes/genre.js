const express = require("express");
const router = express("Router");
const Joi = require("joi");
const Genre = require("../model/genresdb");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const schema = Joi.object({
  name: Joi.string().alphanum().min(5).max(50).required(),
});

router.get("/", async function (req, res) {
  const genres = await Genre.findAll();
  if (!genre) return res.status(404).send("no genre provides");

  res.send(genres);
});

router.get("/:id", async function (req, res) {
  const genre = await Genre.findById(req.params.id);
  if (!genre)
    return res.status(404).send("The genre with the given ID was not provides");

  res.send(genre);
});

router.post("/", auth, async function (req, res) {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(404).send(error.details[0].message);
  }

  const genre = new Genre({
    name: req.body.name,
  });

  await genre.save();

  res.send(genre);
});

router.put("/:id", auth, async function (req, res) {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(404).send(error.details[0].message);
  }

  const genre = await Genre.findByIdAndUpdate(req.params.id, {
    $set: { name: req.body.name },
  });

  if (!genre)
    return res.status(404).send("The genre with the given ID was not provides");

  res.send(genre);
});

router.delete("/:id", [auth, admin], async function (req, res) {
  const genre = await Genres.findByIdAndRemove(req.params.id);
  if (!genre)
    return res.status(404).send("The genre with the given ID was not provides");
  res.send(genre);
});

module.exports = router;
