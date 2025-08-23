const Joi = require('joi');

// Esquema para parámetros de query en búsqueda
const searchParamsSchema = Joi.object({
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

module.exports = {
    searchParamsSchema,
    validateSearchParams
};
