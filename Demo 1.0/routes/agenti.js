const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utils/catchAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const { validateAgent, isLoggedIn } = require("../middleware.js");
const { agentSchema } = require("../schemas.js");

const agenti = require("../controllers/agenti");

const Stan = require("../models/stan.js");
const Agent = require("../models/agent.js");

router
  .route("/")
  .get(catchAsync(agenti.index))

  .post(isLoggedIn, validateAgent, catchAsync(agenti.createAgent));

router.get("/new", isLoggedIn, agenti.renderNewForm);

// router.post("/", isLoggedIn, validateAgent, catchAsync(agent.createAgent));

// router.delete(
//   "/:agentId",
//   isLoggedIn,
//   isAgentAuthor,
//   catchAsync(agents.deleteAgent)
// );

module.exports = router;
