const mongoose = require("mongoose");
const Agent = require("./agent");
const User = require("./user");
const { stanSchema } = require("../schemas");
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const PretragaSchema = new Schema(
  {
    kupiZakupi: { type: String, default: "default" },
    tipNek: { type: String, default: "default" },
    location: { type: String, default: "default" },
    roomNum: { type: String, default: "default" },
    priceRange: { type: String, default: "default" },
  },
  opts
);

PretragaSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
  }
});

module.exports = mongoose.model("Pretraga", PretragaSchema);
