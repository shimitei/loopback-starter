'use strict';
const iconv = require('iconv-lite');
const moment = require('moment');

module.exports = function(Model, options) {
  function csvconvert(model, list, stream) {
    const rn = '\r\n';
    if (model.csvdefinition) {
      const csvdef = model.csvdefinition;
      // header
      {
        const header = csvdef.fields.map(function(def) {
          return def.label;
        }).join(',');
        stream.write(header + rn);
      }
      // data
      for (const item of list) {
        // Access included objects
        // https://loopback.io/doc/en/lb3/Include-filter.html#access-included-objects
        const json = item.toJSON();
        let fields = [];
        for (const def of csvdef.fields) {
          const v = def.value(json);
          fields.push('"' + v + '"');
        }
        const line = fields.join(',');
        stream.write(line + rn);
      }
    } else {
      const propertyNames = Object.keys(model.definition.rawProperties);
      // header
      {
        const header = propertyNames.join(',');
        stream.write(header + rn);
      }
      // data
      for (const item of list) {
        const line = propertyNames.map(function(key) {
          const value = item[key];
          const type = typeof value;
          if (type == 'string') {
            return '"' + value + '"';
          } else if (value instanceof Date) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
          }
          return value;
        }).join(',');
        stream.write(line + rn);
      }
    }
    stream.end();
  }

  function makeCsvFilename(model) {
    let base = model.definition.name;
    if (model.csvdefinition && model.csvdefinition.filename) {
      base = model.csvdefinition.filename;
    }
    return base + moment().format('YYYYMMDD') + '.csv';
  }

  Model.csvexport = function(req, filter, cb) {
    if (Model.csvdefinition && Model.csvdefinition.include) {
      filter = filter || {};
      filter.include = Model.csvdefinition.include;
    }
    Model.find(filter, function(err, list) {
      const filename = makeCsvFilename(Model);
      const rawfilename = encodeURIComponent(filename);
      const stream = iconv.encodeStream('Shift_JIS');
      cb(null, stream,
        'application/force-download',
        "attachment; filename*=utf-8''" + rawfilename);
      csvconvert(Model, list, stream);
    });
  };

  Model.remoteMethod('csvexport', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'filter', type: 'object', 'http': {source: 'query'}},
    ],
    returns: [
      {type: 'file', root: true},
      {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
      {arg: 'Content-Disposition', type: 'string', http: {target: 'header'}},
    ],
  });
};
