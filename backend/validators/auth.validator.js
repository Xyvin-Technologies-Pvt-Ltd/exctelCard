const Joi = require("joi");

const loginValidation = {
  query: Joi.object({
    returnUrl: Joi.string().uri().optional(),
  }),
};

const callbackValidation = {
  query: Joi.object({
    code: Joi.string().required(),
    state: Joi.string().required(),
    session_state: Joi.string().optional(),
    error: Joi.string().optional(),
    error_description: Joi.string().optional(),
  }),
};

const tokenValidation = {
  headers: Joi.object({
    authorization: Joi.string()
      .pattern(/^Bearer\s.+/)
      .required()
      .messages({
        "string.pattern.base":
          'Authorization header must be in the format "Bearer <token>"',
      }),
  }).unknown(true),
};

module.exports = {
  loginValidation,
  callbackValidation,
  tokenValidation,
};
