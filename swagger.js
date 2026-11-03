const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mon API',
      version: '1.0.0',
      description: 'Documentation de l’API du projet',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: [path.join(__dirname, 'app.js'), path.join(__dirname, 'routes/*.js')], // fichiers où se trouvent tes commentaires
};

module.exports = swaggerJsdoc(options);