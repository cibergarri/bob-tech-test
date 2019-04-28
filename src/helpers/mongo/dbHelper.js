import { logger } from '../winston/log';

/**
 * @typedef {Object} dbResult
 * @property {Object} err Error object
 * @property {Promise<{err: Object, count: Number}>} Promise with the result or error
 */

/**
 * Wrapper for find method
 * @param {Object} Model Mongoose Model
 * @param {Object} filter Object with Mongo query
 * @param {Object} opts Query options
 * @param {Object} projection Query projection
 * @returns {Promise<dbResult>} Promise with the result or error
 */
export const find = async (Model, filter, opts = {}, projection = '-__v') => {
  let result;
  let error;
  try {
    const query = Model.find(filter, projection);
    if (opts.skipSize) {
      query.skip(opts.skipSize);
    }
    if (opts.limitSize) {
      query.limit(opts.limitSize);
    }
    if (opts.sortBy) {
      query.sort(opts.sortBy);
    }
    result = await query.exec();
  } catch (err) {
    error = handleDbError('find', Model.collection.name, err);
  }
  return { err: error, doc: result };
};

/**
 * Wrapper for Find By Id method
 * @param {Object} Model Mongoose Model
 * @param {string} id Id to look for
 * @param {Object} projection Query projection
 * @returns {Promise<dbResult>} Promise with the result or error
 */
export const findById = async (Model, id, projection = '-__v') => {
  let result;
  let error;
  try {
    result = await Model.findById(id, projection).exec();
  } catch (err) {
    error = handleDbError('findById', Model.collection.name, err);
  }
  return { err: error, doc: result };
};

/**
 * Wrapper for find method
 * @param {Object} Model Mongoose Model
 * @param {Object} filter Object with Mongo query
 * @param {Object} opts Query options
 * @param {Object} projection Query projection
 * @returns {Promise<dbResult>} Promise with the result or error
 */
export const findOne = async (Model, filter, projection = '-__v') => {
  let result;
  let error;
  try {
    result = await Model.findOne(filter, projection).exec();
  } catch (err) {
    error = handleDbError('findOne', Model.collection.name, err);
  }
  return { err: error, doc: result };
};

/**
 * Wrapper for Find By Id and update method
 * @param {Object} Model Mongoose Model
 * @param {string} id Id to look for
 * @param {Object} update fields to update
 * @param {Object} options  options
 * @returns {Promise<dbResult>} Promise with the result or error
 */
export const findByIdAndUpdate = async (Model, id, update, options = {}) => {
  let result;
  let error;
  try {
    result = await Model.findByIdAndUpdate(id, update, options).exec();
  } catch (err) {
    error = handleDbError('findByIdAndUpdate', Model.collection.name, err);
  }
  return { err: error, doc: result };
};

/**
 * @param {Object} Model mongoDb Model
 * @param {String} id instance id
 * @param {Object} options  options
 * @returns {Promise<{err: Object, doc: Object}>} Promise with the deleted object or an error
 */
export const findByIdAndDelete = async (Model, id, options = {}) => {
  let error;
  let doc;
  try {
    const result = await Model.findByIdAndDelete(id, options).exec();
    if (!result) { // already removed
      return {};
    } else if (result.errors) { // check if this property
      error = handleDbError('findByIdAndDelete', Model.collection.name, result.errors);
    } else {
      // ToDo -> Check if it is returning something
      doc = result;
    }
  } catch (err) {
    error = handleDbError('findByIdAndDelete', Model.collection.name, err);
  }
  return { err: error, doc };
};

/**
 * @param {Object} entity mongoDb model entity
 * @returns {Promise<Error>} Promise with the error if something went wrong, otherwise, undefined
 */
export const save = async (entity) => {
  let error;
  try {
    await entity.save();
  } catch (err) {
    error = handleDbError('save', Object.getPrototypeOf(entity).collection.name, err);
  }
  return error;
};

const handleDbError = (operation, modelName, err) => {
  logger.warn('db %s error, collection %s,\nError: %s', [operation, modelName, err.toString()]);
  return new Error(err);
};
