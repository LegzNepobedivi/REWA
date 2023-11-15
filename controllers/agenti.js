const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Agent = require("../models/agent");

module.exports.index = async (req, res) => {
  const agenti = await Agent.find({});
  res.render("agenti/index", { agenti });
};

module.exports.renderNewForm = (req, res) => {
  res.render("agenti/new");
};

module.exports.createAgent = async (req, res, next) => {
  console.log("Usao");
  const agent = new Agent(req.body.agent);
  agent.author = req.user._id;
  await agent.save();
  req.flash("success", "Agent saved successfully");
  res.redirect(`/agenti`);
};

module.exports.deleteAgent = async (req, res) => {
  const { id } = req.params;
  await Agent.findByIdAndDelete(id);
  req.flash("success", "Agent deleted successfully");
  res.redirect(`/agenti`);
};
