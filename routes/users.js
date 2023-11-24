const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo, isLoggedIn } = require("../middleware");

const users = require("../controllers/users");

router
  .route("/register")
  .get(isLoggedIn, users.renderRegister)
  .post(isLoggedIn, catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirecte: "/login",
    }),
    users.login,
    storeReturnTo
  );

router.get("/logout", users.logout);

module.exports = router;
