const { stanSchema, agentSchema, pretragaSchema } = require("./schemas.js");

const Pretraga = require("./models/pretraga");
const Stan = require("./models/stan");
const Agent = require("./models/agent");

const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // add this line
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateStan = (req, res, next) => {
  const { error } = stanSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const stan = await Stan.findById(id);
  if (!stan.author.equals(req.user._id)) {
    req.flash("error", "Not your stan");
    return res.redirect(`/stanovi/${id}`);
  }
  next();
};

module.exports.isAgentAuthor = async (req, res, next) => {
  const { agentId } = req.params;
  const agent = await Agent.findById(agentId);

  if (!agent.author.equals(req.user._id)) {
    req.flash("error", "Not your stan");
    return res.redirect(`/agenti`);
  }
  next();
};

module.exports.validateAgent = (req, res, next) => {
  const { error } = agentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validatePretraga = (req, res, next) => {
  //console.log(req.body);
  const { error } = pretragaSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// module.exports.isLoggedIn;
