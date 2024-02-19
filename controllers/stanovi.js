const express = require("express");
const router = express.Router({ mergeParams: true });

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const Stan = require("../models/stan");
const Pretraga = require("../models/pretraga");

const { cloudinary } = require("../cloudinary");

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
  res.redirect(`/stanovi/${stan._id}/edit`);
};

module.exports.deleteStan = async (req, res) => {
  const { id } = req.params;
  await Stan.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted stan");
  res.redirect(`/stanovi`);
};

module.exports.index = async (req, res) => {
  let perPage = 12;
  let page = req.query.page || 1;

  const stanovi = await Stan.aggregate([{ $sort: { createdAt: -1 } }]);
  const sveLokacije = stanovi;
    //.skip(perPage * page - perPage)//
    //.limit(perPage)
    //.exec();
    //const count = await Stan.count();

  res.render("stanovi/index", {
    stanovi,
    sveLokacije,
    //current: page,
    //pages: Math.ceil(count / perPage),
  });
};

module.exports.newSearch = async (req, res) => {
  //console.log("pretraga");
  const pretraga = new Pretraga(req.body.pretraga);
  await pretraga.save();
  //console.log(pretraga);
  req.flash("success", "Uspesna pretraga");
  res.redirect("/stanovi/pretraga");
};

//Search
module.exports.searchPage = async (req, res) => {
  let perPage = 12;
  let page = req.query.page || 1;

  const pretrage = await Pretraga.find({});
  const jedna = pretrage[0];
  //const stanovi = await Stan.aggregate([{ $sort: { createdAt: -1 } }]);

  const count = await Stan.count();

  const kupiZakupi = jedna.kupiZakupi;
  const tipNek = jedna.tipNek;
  const location = jedna.location;
  let roomNum = jedna.roomNum;
  const priceRange = parseInt(jedna.priceRange, 10);

  var stanovi;

  //Idemo ifovi
  //xxxx 1
  if (
    kupiZakupi == "default" &&
    tipNek == "default" &&
    location == "default" &&
    roomNum == "default"
  ) {
    stanovi = await Stan.aggregate([
      { $match: { price: { $lte: priceRange } } },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yxxx 2
  if (
    kupiZakupi != "default" &&
    tipNek == "default" &&
    location == "default" &&
    roomNum == "default"
  ) {
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [{ sale: kupiZakupi }, { price: { $lte: priceRange } }],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xyxx 3
  if (
    kupiZakupi == "default" &&
    tipNek != "default" &&
    location == "default" &&
    roomNum == "default"
  ) {
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [{ type: tipNek }, { price: { $lte: priceRange } }],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xxyx 4
  if (
    kupiZakupi == "default" &&
    tipNek == "default" &&
    location != "default" &&
    roomNum == "default"
  ) {
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [{ location: location }, { price: { $lte: priceRange } }],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xxxy 5
  if (
    kupiZakupi == "default" &&
    tipNek == "default" &&
    location == "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [{ structure: roomNum }, { price: { $lte: priceRange } }],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yyxx 6
  if (
    kupiZakupi != "default" &&
    tipNek != "default" &&
    location == "default" &&
    roomNum == "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { type: tipNek },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yxyx 7
  if (
    kupiZakupi != "default" &&
    tipNek == "default" &&
    location != "default" &&
    roomNum == "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { location: location },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yxxy 8
  if (
    kupiZakupi != "default" &&
    tipNek == "default" &&
    location == "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xyyx 9
  if (
    kupiZakupi == "default" &&
    tipNek != "default" &&
    location != "default" &&
    roomNum == "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { type: tipNek },
            { location: location },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xyxy 10
  if (
    kupiZakupi == "default" &&
    tipNek != "default" &&
    location == "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { type: tipNek },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xxyy 11
  if (
    kupiZakupi == "default" &&
    tipNek == "default" &&
    location != "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { location: location },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //xyyy 12
  if (
    kupiZakupi == "default" &&
    tipNek != "default" &&
    location != "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { type: tipNek },
            { location: location },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yxyy 13
  if (
    kupiZakupi != "default" &&
    tipNek == "default" &&
    location != "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { location: location },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yyxy 14
  if (
    kupiZakupi != "default" &&
    tipNek != "default" &&
    location == "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { type: tipNek },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yyyx 15
  if (
    kupiZakupi != "default" &&
    tipNek != "default" &&
    location != "default" &&
    roomNum == "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { type: tipNek },
            { location: location },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //yyyy 16
  if (
    kupiZakupi != "default" &&
    tipNek != "default" &&
    location != "default" &&
    roomNum != "default"
  ) {
    roomNum = parseFloat(roomNum);
    stanovi = await Stan.aggregate([
      {
        $match: {
          $and: [
            { sale: kupiZakupi },
            { type: tipNek },
            { location: location },
            { structure: roomNum },
            { price: { $lte: priceRange } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  }

  //console.log(stanovi);

  await Pretraga.deleteMany({});

  const sveLokacije = await Stan.aggregate([{ $sort: { createdAt: -1 } }]);

  res.render("stanovi/index", {
    stanovi,
    sveLokacije,
    //current: page,
    //pages: Math.ceil(count / perPage),
  });

  //   .skip(perPage * page - perPage)
  //   .limit(perPage)
  //   .exec();
  // { $match:{$or :[{ sale: kr1, kr2: true}]}
};
