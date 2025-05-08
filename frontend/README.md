# J-Store: Frontend

J-Store is an e-commerce web application built with modern frontend technologies. This repository contains the frontend codebase for an online store that allows users to browse products, add items to cart, place orders, and manage their shopping experience.

The application is built using React with TypeScript and leverages a comprehensive tech stack including:

- Vite for fast development and optimized builds
- Material UI for a polished, responsive user interface
- React Query for efficient data fetching and state management
- Formik and Yup for form handling and validation
- MSW for API mocking during development
- AWS CDK for infrastructure as code deployment
- Amazon S3 for static website hosting
- Amazon CloudFront for global content delivery

The project follows a component-based architecture with dedicated pages for product listings, shopping cart, order management, and admin functionality for product imports. It's designed with best practices in mind, including comprehensive testing with Vitest and code quality tools like ESLint and Prettier. The application is deployed using AWS CDK to provision an S3 bucket for hosting and CloudFront distribution for fast, secure content delivery worldwide.

## Available Scripts

`start`

Starts the project in dev mode with mocked API on local environment.

`build`

Builds the project for production in `dist` folder.

`preview`

Starts the project in production mode on local environment.

`test`, `test:ui`, `test:coverage`

Runs tests in console, in browser or with coverage.

`lint`, `prettier`

Runs linting and formatting for all files in `src` folder.

## Deployment

This project uses AWS CDK to deploy the website to an S3 bucket with CloudFront distribution.

1. Install dependencies:

`npm install`

2. Build and deploy:

`npm run deploy:website`

3. To destroy the infrastructure:

`npm run cdk:destroy`

The CloudFront URL will be displayed in the output after deployment.
