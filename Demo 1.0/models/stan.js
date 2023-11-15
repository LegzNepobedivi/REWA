const mongoose = require("mongoose");
const Agent = require("./agent");
const User = require("./user");
const { stanSchema } = require("../schemas");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const StanSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: { type: [Number], required: true },
    },
    sale: String,
    location: String,
    price: Number,
    structure: Number,
    areaSize: String,
    toilets: Number,
    level: Number,
    etaza: String,
    description: String,

    language: { type: String, default: "Srpski" },
    types: [String],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agentName: String,
    agentLicense: String,
    agentNumber: Number,
    agentEmail: String,

    videoLink: String,
  },
  opts
);

StanSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/stanovi/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

StanSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
  }
});

module.exports = mongoose.model("Stan", StanSchema);
