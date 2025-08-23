/**
 * Manejador de respuestas para la función createBook
 */
class CreateBookResponseHandler {
    /**
     * Respuesta exitosa
     * @param {Object} data - Datos de la respuesta
     * @returns {Object} - Respuesta HTTP
     */
    static success(data = {}) {
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data)
        };
    }

    /**
     * Respuesta de error
     * @param {number} statusCode - Código de estado HTTP
     * @param {string} error - Tipo de error
     * @param {string} message - Mensaje de error
     * @param {Array} details - Detalles adicionales del error
     * @returns {Object} - Respuesta HTTP
     */
    static error(statusCode = 500, error = 'Internal Server Error', message = 'An error occurred', details = null) {
        const response = {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error,
                message
            })
        };

        if (details) {
            response.body = JSON.stringify({
                error,
                message,
                details
            });
        }

        return response;
    }

    /**
     * Respuesta de error de validación
     * @param {Array} details - Detalles de errores de validación
     * @returns {Object} - Respuesta HTTP
     */
    static validationError(details) {
        return this.error(400, 'Validation Error', 'Los datos proporcionados no son válidos', details);
    }

    /**
     * Respuesta de error de método no permitido
     * @returns {Object} - Respuesta HTTP
     */
    static methodNotAllowed() {
        return this.error(405, 'Method Not Allowed', 'Only POST method is allowed');
    }

    /**
     * Respuesta de error de solicitud incorrecta
     * @param {string} message - Mensaje de error
     * @returns {Object} - Respuesta HTTP
     */
    static badRequest(message = 'Bad Request') {
        return this.error(400, 'Bad Request', message);
    }

    /**
     * Respuesta de error interno del servidor
     * @param {string} message - Mensaje de error
     * @returns {Object} - Respuesta HTTP
     */
    static internalServerError(message = 'An error occurred while creating the book') {
        return this.error(500, 'Internal Server Error', message);
    }
}

module.exports = CreateBookResponseHandler;
