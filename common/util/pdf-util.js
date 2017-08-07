'use strict';

const RenderPDF = require('chrome-headless-render-pdf');
const fs = require('fs');
const tmp = require('tmp');

/**
 * @param {*} url
 * @param {*} callback function(err, stream)
 */
async function htmlToPdf(url, callback) {
  try {
    const tmpfile = tmp.fileSync();
    await RenderPDF.generateSinglePdf(
      url,
      tmpfile.name,
      {
        includeBackground: true,
        // printLogs: true,
      },
    );
    callback(null, fs.createReadStream(tmpfile.name));
  } catch (err) {
    callback(err);
  }
}

/**
 * @param {*} url
 * @param {*} res
 */
async function downloadAsPdf(url, res) {
  const tmpfile = tmp.fileSync();
  await RenderPDF.generateSinglePdf(
    url,
    tmpfile.name,
    {
      includeBackground: true,
      // printLogs: true,
    },
  );
  res.header('Content-Type', 'application/pdf');
  res.sendFile(tmpfile.name);
}

module.exports = {
  htmlToPdf,
  downloadAsPdf,
};
