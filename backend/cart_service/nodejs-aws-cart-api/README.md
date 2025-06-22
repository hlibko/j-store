# Cart Service API

## Description
This service handles shopping cart operations for the J-Store application.

## Database Setup
The service uses PostgreSQL for data storage. The database connection is configured through environment variables.

### Database Configuration
- Host: j-store-cart-db.c5kym0uqosil.eu-north-1.rds.amazonaws.com
- Port: 5432
- Database: j-store-cart-db
- Username: postgres

### Running Migrations
To set up the database schema:

```bash
npm run migration:run
```

To revert migrations:

```bash
npm run migration:revert
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

```bash
# deploy to AWS Lambda
$ npm run deploy:lambda
```