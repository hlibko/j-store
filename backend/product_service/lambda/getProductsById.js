exports.handler = async function (event) {
    const products = [
        {
            description: "Short Product Description 1",
            id: "1",
            price: 101,
            title: "Product 1",
        },
        {
            description: "Short Product Description 2",
            id: "2",
            price: 102,
            title: "Product 2",
        },
        {
            description: "Short Product Description 3",
            id: "3",
            price: 103,
            title: "Product 3",
        },
        {
            description: "Short Product Description 4",
            id: "4",
            price: 104,
            title: "Product 4",
        },
        {
            description: "Short Product Description 5",
            id: "5",
            price: 105,
            title: "Product 5",
        },
    ];

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
