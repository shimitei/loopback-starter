'use strict';
const env = process.env.NODE_ENV || 'development';
if (env != 'development') {
  process.exit();
}
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const logger = require(path.resolve(__dirname, '../server/logger/logger'));
const ds = app.dataSources.psql;
const async = require('async');
const XLSX = require('xlsx');
const XLSXutils = XLSX.utils;

async.waterfall([
  failsafe,
  importXlsx,
], function(err, result) {
  if (err) logger.error(err);
  else logger.info('Done!');
  ds.disconnect();
  process.exit();
});

function failsafe(callback) {
  app.models.RoleGroup.count(function(err, count) {
    if (err) return callback(err);
    if (count === 0) {
      return callback();
    }
    return callback(new Error('Data already exists!'));
  });
}

function getHeader(sheet) {
  let result = [];
  const range = XLSXutils.decode_range(sheet['!ref']);
  const endColIndex = range.e.c;
  for (let i = 0; i <= endColIndex; i++) {
    const address = XLSXutils.encode_cell({r: 0, c: i});
    const cell = sheet[address];
    result.push(cell.v);
  }
  return result;
}

function sheetToJson(sheet, model) {
  let result = [];
  const header = getHeader(sheet);
  const colCount = header.length;
  const range = XLSXutils.decode_range(sheet['!ref']);
  const endRowIndex = range.e.r;
  const def = model.definition.rawProperties;
  const objectFilter = function(s) {
    return JSON.parse(s);
  };
  const noFilter = function(s) { return s; };
  const filters = header.map(function(item) {
    const prop = def[item];
    if (prop) {
      if (prop.type === 'object') return objectFilter;
    }
    return noFilter;
  });
  for (let r = 1; r <= endRowIndex; r++) {
    const obj = {};
    for (let c = 0; c < colCount; c++) {
      const address = XLSXutils.encode_cell({r: r, c: c});
      const cell = sheet[address];
      let value = null;
      if (cell) {
        switch (cell.t) {
          case 'b': value = cell.v; break;
          default: value = cell.w; break;
        }
      }
      obj[header[c]] = filters[c](value);
    }
    result.push(obj);
  }
  return result;
}

let workbook;
function importXlsx(callback) {
  workbook = XLSX.readFile(path.resolve(__dirname, 'testdata.xlsx'));
  const targetModelNames = [
    'RoleGroup',
    'Account',
  ];
  async.eachSeries(
    targetModelNames,
    importFromSheet,
    function(err) {
      callback(err);
    }
  );
}

function findByName(ar, name, key) {
  return ar.find(function(element, index, array) {
    return (element[key] == name);
  });
}

function findRelation(model, filter, next) {
  model.find(filter, function(err, list) {
    return next(err, list);
  });
}

function getRelationDef(csvRows) {
  const allRelations = [
    {
      prop: 'roleGroup',
      modelName: 'RoleGroup',
      where: 'name',
      retation: 'roleGroupId',
    },
    {
      prop: 'account',
      modelName: 'Account',
      where: 'username',
      retation: 'accountId',
    },
  ];
  const relations = [];
  if (csvRows.length > 0) {
    const standard = csvRows[0];
    allRelations.forEach(function(def) {
      if (standard[def.prop] !== undefined) {
        relations.push(def);
      }
    });
  }
  return relations;
}
function sheetToData(sheet, model, next) {
  const result = sheetToJson(sheet, model);
  const relations = getRelationDef(result);
  if (relations.length > 0) {
    async.eachSeries(
      relations,
      function(def, cb) {
        let set = new Set();
        result.forEach(function(item) {
          set.add(item[def.prop]);
        });

        if (set.size > 0) {
          const filter = {where: {}};
          filter.where[def.where] = {inq: Array.from(set.values())};
          findRelation(app.models[def.modelName], filter, function(err, list) {
            if (err) return cb(err);
            for (let item of result) {
              const r = findByName(list, item[def.prop], def.where);
              item[def.retation] = r && r.id;
            }
            return cb(null);
          });
        }
      },
      function(err) {
        if (err) return next(err);
        return next(null, result);
      }
    );
  } else {
    return next(null, result);
  }
}

function importFromSheet(modelName, next) {
  logger.info('import:', modelName);
  const sheet = workbook.Sheets[modelName];
  if (!sheet) return next();
  const model = app.models[modelName];
  sheetToData(sheet, model, function(err, data) {
    if (err) return next(err);
    async.eachSeries(data, function(item, callback) {
      model.create(item, function(err, created) {
        if (err) return callback(err);
        logger.info('created:', created);
        callback();
      });
    }, function(err) {
      next(err);
    });
  });
}
