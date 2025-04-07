// src/swaggerOptions.ts
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Noteroom API',
      version: '1.0.0',
      description: 'API documentation for Noteroom',
    },
    servers: [
      {
        url: 'http://localhost:2000', // Change to your server's URL
      },
    ],
  },
  apis: ['./swaggers/*.ts'], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
