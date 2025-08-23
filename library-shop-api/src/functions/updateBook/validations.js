const Joi = require('joi');

// Esquema para validar ID de libro
const bookIdSchema = Joi.string().required().messages({
    'string.empty': 'El ID del libro es requerido',
    'any.required': 'El ID del libro es requerido'
});

// Esquema de validación para actualización (campos opcionales)
const updateBookSchema = Joi.object({
    title: Joi.string().min(1).max(200).optional().messages({
        'string.empty': 'El título no puede estar vacío',
        'string.min': 'El título debe tener al menos 1 carácter',
        'string.max': 'El título no puede exceder 200 caracteres'
    }),
    author: Joi.string().min(1).max(100).optional().messages({
        'string.empty': 'El autor no puede estar vacío',
        'string.min': 'El autor debe tener al menos 1 carácter',
        'string.max': 'El autor no puede exceder 100 caracteres'
    }),
    isbn: Joi.string().pattern(/^[0-9-]{10,17}$/).optional().messages({
        'string.pattern.base': 'El ISBN debe tener entre 10 y 17 caracteres y contener solo números y guiones'
    }),
    price: Joi.number().positive().precision(2).max(999999.99).optional().messages({
        'number.base': 'El precio debe ser un número',
        'number.positive': 'El precio debe ser un número positivo',
        'number.precision': 'El precio no puede tener más de 2 decimales',
        'number.max': 'El precio no puede exceder 999,999.99'
    }),
    description: Joi.string().max(1000).optional().messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
    publishedDate: Joi.date().iso().max('now').optional().messages({
        'date.format': 'La fecha de publicación debe estar en formato ISO (YYYY-MM-DD)',
        'date.max': 'La fecha de publicación no puede ser futura'
    })
}).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar',
    'object.unknown': 'Campo no permitido: {#label}'
});

// Función para validar datos de actualización
function validateUpdateBookData(data) {
    const { error, value } = updateBookSchema.validate(data, {
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
            message: 'Los datos proporcionados no son válidos',
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
    updateBookSchema,
    bookIdSchema,
    validateUpdateBookData,
    validateBookId
};
