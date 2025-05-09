const { products } = require('./mockData');

exports.handler = async function (event) {
    // Extract productId from path parameters
    const productId = event.pathParameters?.productId;

    if (!productId) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://d1y74wccw6evhw.cloudfront.net',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            body: JSON.stringify({ message: "Product ID is required" }),
        };
    }

    // Find the product with the matching ID
    const product = products.find(p => p.id === productId);

    if (!product) {
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://d1y74wccw6evhw.cloudfront.net',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            body: JSON.stringify({ message: "Product not found" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://d1y74wccw6evhw.cloudfront.net',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        body: JSON.stringify(product),
    };
}
