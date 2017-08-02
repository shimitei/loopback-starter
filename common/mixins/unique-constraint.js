'use strict';
const logger = require('../../server/logger/logger');
/**
 * Declarative unique constraint.
 * WARNING: Not define unique constraint on the database table
 * ex)
 * - one column
 *   "mixins": {
 *     "UniqueConstraint": {
 *       "column": "uniqueId"
 *     },
 *   },
 * - more
 *   "mixins": {
 *     "UniqueConstraint": {
 *       "column": ["uniqueId", "uniqueName"]
 *     },
 *   },
 */
module.exports = function(Model, options) {
  function getOptionsColumn() {
    let result;
    if (options && options.column) {
      result = (Array.isArray(options.column))
        ? result = options.column
        : [String(options.column)];
    }
    return result;
  }

  function addUniqueConstraint() {
    const columns = getOptionsColumn();
    if (columns) {
      columns.forEach(function(columnName) {
        logger.debug('add validatesUniquenessOf',
          Model.definition.name, columnName);
        Model.validatesUniquenessOf(columnName);
      });
    }
  }

  addUniqueConstraint();
};
