const express = require("express");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router({ mergeParams: true });
const stanovi = require("../controllers/stanovi");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { isLoggedIn, isAuthor, validateStan } = require("../middleware");

const { stanSchema } = require("../schemas.js");
const Stan = require("../models/stan");
//const stan = require("../models/stan");
//const Review = require("./models/review");

router
  .route("/")
  .get(catchAsync(stanovi.index))

  .post(
    isLoggedIn,
    upload.array("image"),
    validateStan,
    catchAsync(stanovi.createStan)
  );

router.get("/new", isLoggedIn, stanovi.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(stanovi.showStan))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateStan,
    catchAsync(stanovi.updateStan)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(stanovi.deleteStan));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(stanovi.renderEditForm)
);

module.exports = router;
