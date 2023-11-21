const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.exapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

//JEBENI VIDEO LINK
module.exports.stanSchema = Joi.object({
  stan: Joi.object({
    title: Joi.string().required().escapeHTML(),
    sale: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    structure: Joi.number().min(0),
    areaSize: Joi.string().required().escapeHTML(),
    toilets: Joi.number().min(0),
    level: Joi.number(),
    etaza: Joi.string().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
    language: Joi.string().escapeHTML(),
    agentName: Joi.string().required().escapeHTML(),
    agentLicense: Joi.string().escapeHTML(),
    agentNumber: Joi.string().required(),
    agentEmail: Joi.string().escapeHTML(),
    videoLink: Joi.string(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.agentSchema = Joi.object({
  agent: Joi.object({
    name: Joi.string().required().escapeHTML(),
    mobile: Joi.string().required(),
    mail: Joi.string().required().escapeHTML(),
    license: Joi.string().required().escapeHTML(),
  }).required(),
});
