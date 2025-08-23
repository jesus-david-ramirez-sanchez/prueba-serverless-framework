/**
 * Utilidades para manejo de fechas en la aplicación
 */

/**
 * Convierte una fecha a string ISO para almacenamiento en DynamoDB
 * @param {Date|string} date - Fecha a convertir
 * @returns {string|undefined} - Fecha en formato ISO string o undefined si no hay fecha
 */
function toISOString(date) {
    if (!date) return undefined;
    return new Date(date).toISOString();
}

/**
 * Procesa un objeto de datos para convertir todas las fechas a formato ISO string
 * @param {Object} data - Objeto con datos que pueden contener fechas
 * @param {Array} dateFields - Array de nombres de campos que son fechas
 * @returns {Object} - Objeto con las fechas convertidas
 */
function processDateFields(data, dateFields = ['publishedDate']) {
    const processed = { ...data };
    
    dateFields.forEach(field => {
        if (processed[field]) {
            processed[field] = toISOString(processed[field]);
        }
    });
    
    return processed;
}

module.exports = {
    toISOString,
    processDateFields
};
