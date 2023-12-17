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
    type: String,
    location: String,
    price: Number,
    structure: String,
    areaSize: String,
    toilets: Number,
    level: Number,
    etaza: String,
    description: String,

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    agentName: String,
    agentLicense: String,
    agentNumber: String,
    agentEmail: String,

    videoLink: String,

    daProvizija: { type: Boolean, default: false },
    neProvizija: { type: Boolean, default: false },
    lift: { type: Boolean, default: false },
    terasa: { type: Boolean, default: false },
    novogradnja: { type: Boolean, default: false },
    starogradnja: { type: Boolean, default: false },
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
