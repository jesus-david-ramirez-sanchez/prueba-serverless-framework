const Joi = require('joi');

// Esquema para validar ID de libro
const bookIdSchema = Joi.string().required().messages({
    'string.empty': 'El ID del libro es requerido',
    'any.required': 'El ID del libro es requerido'
});

// Función para validar ID de libro
function validateBookId(id) {
    const { error, value } = bookIdSchema.validate(id);

    if (error) {
        const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        throw {
            type: 'VALIDATION_ERROR',
            message: 'El ID del libro no es válido',
            details: errorDetails
        };
    }

    return value;
}

module.exports = {
    bookIdSchema,
    validateBookId
};
