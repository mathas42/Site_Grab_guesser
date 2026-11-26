const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grab Food Guesser API',
      version: '1.1.0',
      description: 'API Documentation',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Produit', description: 'Dishes and catalogue' },
      { name: 'Partie', description: 'Game progress' },
      { name: 'Utilisateur', description: 'Account and profile' },
      { name: 'Admin', description: 'Users and dishes management (admin only)' },
    ],
  },
  apis: [path.join(__dirname, 'app.js'), path.join(__dirname, 'routes/*.js').replace(/\\/g, '/')],// fichiers où se trouvent tes commentaires
};

module.exports = swaggerJsdoc(options);