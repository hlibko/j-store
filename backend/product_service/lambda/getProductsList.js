const { products } = require('./mockData');
const { FRONTEND_URL } = require('./constants');

exports.handler = async function () {

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': FRONTEND_URL,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(products),
  }
}