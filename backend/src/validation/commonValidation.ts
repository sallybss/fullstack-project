import Joi from "joi";

export const validateOptions: Joi.ValidationOptions = {
  abortEarly: false,
  convert: true,
  stripUnknown: true,
};

export function validationMessage(error: Joi.ValidationError): string {
  return error.details.map((detail) => detail.message).join(", ");
}

export function httpUrlSchema(maxLength: number) {
  return Joi.string()
    .trim()
    .max(maxLength)
    .uri({ scheme: ["http", "https"] })
    .allow("");
}
