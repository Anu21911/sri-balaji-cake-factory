const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  users: [],
  owners: [],
  products: [],
  orders: [],
  customCakes: [],
  notifications: [],
  auditLogs: [],
  settings: []
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return { ...defaultData };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return { ...defaultData };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
}

class Collection {
  constructor(name) {
    this.name = name;
  }

  async find(query = {}) {
    const db = readDb();
    const items = db[this.name] || [];
    return items.filter(item => matchQuery(item, query));
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    const db = readDb();
    const items = db[this.name] || [];
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(doc) {
    const db = readDb();
    if (!db[this.name]) db[this.name] = [];
    const newDoc = {
      _id: doc._id || crypto.randomUUID(),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db[this.name].push(newDoc);
    writeDb(db);
    return newDoc;
  }

  async insertMany(docs) {
    const created = [];
    for (const doc of docs) {
      created.push(await this.create(doc));
    }
    return created;
  }

  async updateOne(query, update) {
    const db = readDb();
    const items = db[this.name] || [];
    const index = items.findIndex(item => matchQuery(item, query));
    if (index === -1) return { matchedCount: 0, modifiedCount: 0 };

    const updateData = update.$set ? update.$set : update;
    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return { matchedCount: 1, modifiedCount: 1, doc: items[index] };
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const db = readDb();
    const items = db[this.name] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const updateData = update.$set ? update.$set : update;
    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const db = readDb();
    const items = db[this.name] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const removed = items.splice(index, 1)[0];
    writeDb(db);
    return removed;
  }

  async deleteMany(query = {}) {
    const db = readDb();
    const items = db[this.name] || [];
    const remaining = items.filter(item => !matchQuery(item, query));
    const deletedCount = items.length - remaining.length;
    db[this.name] = remaining;
    writeDb(db);
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }
}

function matchQuery(item, query) {
  for (const key of Object.keys(query)) {
    if (key === '$or') {
      const orMatched = query['$or'].some(subQ => matchQuery(item, subQ));
      if (!orMatched) return false;
      continue;
    }
    const queryVal = query[key];
    const itemVal = item[key];

    if (queryVal && typeof queryVal === 'object' && queryVal.$regex) {
      const regex = new RegExp(queryVal.$regex, queryVal.$options || 'i');
      if (!regex.test(itemVal || '')) return false;
    } else if (queryVal && typeof queryVal === 'object' && queryVal.$in) {
      if (!queryVal.$in.includes(itemVal)) return false;
    } else if (itemVal !== queryVal) {
      return false;
    }
  }
  return true;
}

module.exports = {
  localDb: {
    users: new Collection('users'),
    owners: new Collection('owners'),
    products: new Collection('products'),
    orders: new Collection('orders'),
    customCakes: new Collection('customCakes'),
    notifications: new Collection('notifications'),
    auditLogs: new Collection('auditLogs'),
    settings: new Collection('settings')
  }
};
