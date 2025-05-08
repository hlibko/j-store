exports.handler = async function () {
  const products = [
    {
      description: "Short Product Description 1",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      price: 101,
      title: "Product 1",
    },
    {
      description: "Short Product Description 2",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
      price: 102,
      title: "Product 2",
    },
    {
      description: "Short Product Description 3",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
      price: 103,
      title: "Product 3",
    },
    {
      description: "Short Product Description 4",
      id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
      price: 104,
      title: "Product 4",
    },
    {
      description: "Short Product Description 5",
      id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
      price: 105,
      title: "Product 5",
    },
  ];

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: products,
  }
}
