const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description:
        'REST API for the Job Portal application — candidates, employers, jobs, applications, admin.',
    },
    servers: [{ url: '/api', description: 'API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

try {
  module.exports = swaggerJsdoc(options);
} catch {
  module.exports = { openapi: '3.0.0', info: { title: 'Job Portal API', version: '1.0.0' }, paths: {} };
}
