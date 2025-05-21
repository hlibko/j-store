#!/bin/bash

echo "Populating J-Store-Products table with test data..."

# Product 1: Smartphone
aws dynamodb put-item \
    --table-name J-Store-Products \
    --item '{
        "id": {"S": "f47ac10b-58cc-4372-a567-0e02b2c3d479"},
        "title": {"S": "Smartphone X1"},
        "description": {"S": "Latest generation smartphone with 6.7 inch display and 128GB storage"},
        "price": {"N": "79900"}
    }' \
    --profile admin-1

# Product 2: Laptop
aws dynamodb put-item \
    --table-name J-Store-Products \
    --item '{
        "id": {"S": "a47bc18b-68cd-4472-b567-1e02b2c3d123"},
        "title": {"S": "UltraBook Pro"},
        "description": {"S": "Lightweight laptop with 16GB RAM and 512GB SSD"},
        "price": {"N": "129900"}
    }' \
    --profile admin-1

# Product 3: Headphones
aws dynamodb put-item \
    --table-name J-Store-Products \
    --item '{
        "id": {"S": "c47dc28b-78ce-4572-c567-2e02b2c3d789"},
        "title": {"S": "Noise Cancelling Headphones"},
        "description": {"S": "Wireless over-ear headphones with active noise cancellation"},
        "price": {"N": "24900"}
    }' \
    --profile admin-1

# Product 4: Smartwatch
aws dynamodb put-item \
    --table-name J-Store-Products \
    --item '{
        "id": {"S": "d47ec38b-88cf-4672-d567-3e02b2c3d456"},
        "title": {"S": "FitTrack Watch"},
        "description": {"S": "Fitness tracking smartwatch with heart rate monitor"},
        "price": {"N": "19900"}
    }' \
    --profile admin-1

# Product 5: Tablet
aws dynamodb put-item \
    --table-name J-Store-Products \
    --item '{
        "id": {"S": "e47fc48b-98cg-4772-e567-4e02b2c3d321"},
        "title": {"S": "TabPro 10"},
        "description": {"S": "10-inch tablet with stylus support and 64GB storage"},
        "price": {"N": "39900"}
    }' \
    --profile admin-1

echo "Populating J-Store-Stocks table with test data..."

# Stock for Product 1
aws dynamodb put-item \
    --table-name J-Store-Stocks \
    --item '{
        "product_id": {"S": "f47ac10b-58cc-4372-a567-0e02b2c3d479"},
        "count": {"N": "25"}
    }' \
    --profile admin-1

# Stock for Product 2
aws dynamodb put-item \
    --table-name J-Store-Stocks \
    --item '{
        "product_id": {"S": "a47bc18b-68cd-4472-b567-1e02b2c3d123"},
        "count": {"N": "15"}
    }' \
    --profile admin-1

# Stock for Product 3
aws dynamodb put-item \
    --table-name J-Store-Stocks \
    --item '{
        "product_id": {"S": "c47dc28b-78ce-4572-c567-2e02b2c3d789"},
        "count": {"N": "50"}
    }' \
    --profile admin-1

# Stock for Product 4
aws dynamodb put-item \
    --table-name J-Store-Stocks \
    --item '{
        "product_id": {"S": "d47ec38b-88cf-4672-d567-3e02b2c3d456"},
        "count": {"N": "30"}
    }' \
    --profile admin-1

# Stock for Product 5
aws dynamodb put-item \
    --table-name J-Store-Stocks \
    --item '{
        "product_id": {"S": "e47fc48b-98cg-4772-e567-4e02b2c3d321"},
        "count": {"N": "20"}
    }' \
    --profile admin-1

echo "Test data population complete!"
