import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FoodPilot Event Service API',
            version: '1.0.0',
            description: 'API para administración de eventos, reportes de ventas y estadísticas de uso',
            contact: {
                name: 'HexaCode',
                email: 'official.hexacodee@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/eventService/v1',
            },
        ],
        tags: [
            {
                name: 'Events',
                description: 'Operaciones relacionadas con eventos'
            },
            {
                name: 'Sales Reports',
                description: 'Operaciones relacionadas con reportes de ventas'
            },
            {
                name: 'Usage Stats',
                description: 'Operaciones relacionadas con estadísticas de uso'
            }
        ],
    },
    apis: [
        './src/events/*.js',
        './src/salesReport/*.js',
        './src/usageStats/*.js',
    ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUI };
