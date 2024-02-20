const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const AgentSchema = new Schema(
  {
    name: String,
    mobile: String,
    mail: String,
    license: String,
    position: String,
    description: String,
    prikazatiMejl: { type: Boolean, default: false },
    prikazatiTelefon: { type: Boolean, default: false },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  opts
);

AgentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
  }
});

module.exports = mongoose.model("Agent", AgentSchema);
