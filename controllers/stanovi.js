const express = require("express");
const router = express.Router({ mergeParams: true });

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const Stan = require("../models/stan");

const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  let perPage = 12;
  let page = req.query.page || 1;

  const stanovi = await Stan.aggregate([{ $sort: { createdAt: -1 } }])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();
  const count = await Stan.count();

  res.render("stanovi/index", {
    stanovi,
    current: page,
    pages: Math.ceil(count / perPage),
  });
};

module.exports.mapa = async (req, res) => {
  const stanovi = await Stan.find({});
  res.render("mapa", { stanovi });
};

module.exports.renderNewForm = (req, res) => {
  res.render("stanovi/new");
};

module.exports.createStan = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.stan.location,
      limit: 1,
    })
    .send();

  const stan = new Stan(req.body.stan);
  stan.geometry = geoData.body.features[0].geometry;
  stan.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  stan.author = req.user._id;
  await stan.save();
  console.log(stan);
  req.flash("success", "Successfully made a new stan");
  res.redirect(`/stanovi/${stan._id}`);
};

module.exports.showStan = async (req, res) => {
  const stan = await Stan.findById(req.params.id)
    // .populate({
    //   path: "agents",
    //   populate: {
    //     path: "author",
    //   },
    // })
    .populate("author");
  if (!stan) {
    req.flash("error", "Cannot find that stan");
    return res.redirect("/stanovi");
  }
  res.render("stanovi/show", { stan });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const stan = await Stan.findById(req.params.id);
  if (!stan) {
    req.flash("error", "Cannot find that stan");
    return res.redirect("/stanovi");
  }
  res.render("stanovi/edit", { stan });
};

module.exports.updateStan = async (req, res) => {
  const { id } = req.params;
  const stan = await Stan.findByIdAndUpdate(id, {
    ...req.body.stan,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  stan.images.push(...imgs);

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await stan.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(stan);
  }

  await stan.save();
  req.flash("success", "Successfully updated stan!");
  res.redirect(`/stanovi/${stan._id}`);
};

module.exports.deleteStan = async (req, res) => {
  const { id } = req.params;
  await Stan.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted stan");
  res.redirect(`/stanovi`);
};
