export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
}

export interface APIGatewayEvent {
    pathParameters?: {
        productId?: string;
    };
    body?: string;
}

export interface APIGatewayResponse {
    statusCode: number;
    headers: {
        [header: string]: string;
    };
    body: string;
}