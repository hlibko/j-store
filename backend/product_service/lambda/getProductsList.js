const { products } = require('./mockData');

exports.handler = async function () {

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://d1y74wccw6evhw.cloudfront.net',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(products),
  }
}
