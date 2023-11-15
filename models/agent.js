const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const AgentSchema = new Schema(
  {
    name: String,
    mobile: Number,
    mail: String,
    license: String,
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
