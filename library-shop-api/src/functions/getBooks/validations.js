const Joi = require('joi');

// Esquema para validar ID de libro
const bookIdSchema = Joi.string().required().messages({
    'string.empty': 'El ID del libro es requerido',
    'any.required': 'El ID del libro es requerido'
});

// Esquema para parámetros de query en búsqueda
const searchParamsSchema = Joi.object({
    id: Joi.string().optional(),
    author: Joi.string().optional(),
    title: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional().messages({
        'number.base': 'El límite debe ser un número',
        'number.integer': 'El límite debe ser un número entero',
        'number.min': 'El límite debe ser al menos 1',
        'number.max': 'El límite no puede exceder 100'
    }),
    offset: Joi.number().integer().min(0).default(0).optional().messages({
        'number.base': 'El offset debe ser un número',
        'number.integer': 'El offset debe ser un número entero',
        'number.min': 'El offset no puede ser negativo'
    })
});

// Función para validar parámetros de búsqueda
function validateSearchParams(data) {
    const { error, value } = searchParamsSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        throw {
            type: 'VALIDATION_ERROR',
            message: 'Los parámetros de búsqueda no son válidos',
            details: errorDetails
        };
    }

    return value;
}

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
    searchParamsSchema,
    bookIdSchema,
    validateSearchParams,
    validateBookId
};
