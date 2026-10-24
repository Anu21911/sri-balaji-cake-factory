const mongoose = require('mongoose');
const { localDb } = require('../utils/localDb');
const { getDbStatus } = require('../config/db');

function createModel(name, schemaDef, localCollectionName) {
  let MongooseModel;
  try {
    MongooseModel = mongoose.model(name);
  } catch (e) {
    const schema = new mongoose.Schema(schemaDef, {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    });
    MongooseModel = mongoose.model(name, schema);
  }

  const localCol = localDb[localCollectionName];

  return {
    async find(query = {}) {
      if (getDbStatus().isConnected) {
        return MongooseModel.find(query).sort({ createdAt: -1 }).lean();
      }
      const res = await localCol.find(query);
      return res.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },

    async findOne(query = {}) {
      if (getDbStatus().isConnected) {
        return MongooseModel.findOne(query).lean();
      }
      return localCol.findOne(query);
    },

    async findById(id) {
      if (getDbStatus().isConnected) {
        return MongooseModel.findById(id).lean();
      }
      return localCol.findById(id);
    },

    async create(data) {
      if (getDbStatus().isConnected) {
        const doc = await MongooseModel.create(data);
        return doc.toObject();
      }
      return localCol.create(data);
    },

    async insertMany(docs) {
      if (getDbStatus().isConnected) {
        return MongooseModel.insertMany(docs);
      }
      return localCol.insertMany(docs);
    },

    async updateOne(query, update) {
      if (getDbStatus().isConnected) {
        return MongooseModel.updateOne(query, update);
      }
      return localCol.updateOne(query, update);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      if (getDbStatus().isConnected) {
        return MongooseModel.findByIdAndUpdate(id, update, { new: true, ...options }).lean();
      }
      return localCol.findByIdAndUpdate(id, update, options);
    },

    async findByIdAndDelete(id) {
      if (getDbStatus().isConnected) {
        return MongooseModel.findByIdAndDelete(id).lean();
      }
      return localCol.findByIdAndDelete(id);
    },

    async deleteMany(query = {}) {
      if (getDbStatus().isConnected) {
        return MongooseModel.deleteMany(query);
      }
      return localCol.deleteMany(query);
    },

    async countDocuments(query = {}) {
      if (getDbStatus().isConnected) {
        return MongooseModel.countDocuments(query);
      }
      return localCol.countDocuments(query);
    }
  };
}

module.exports = { createModel };
