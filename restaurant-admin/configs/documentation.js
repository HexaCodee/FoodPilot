import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FoodPilot Restaurant Admin API',
            version: '1.0.0',
            description: 'API para administración de restaurantes, menús y mesas',
            contact: {
                name: 'HexaCode',
                email: 'official.hexacodee@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/restaurantAdmin/v1',
            },
        ],
        tags: [
            {
                name: 'Menus',
                description: 'Operaciones relacionadas con menús'
            },
            {
                name: 'Restaurants',
                description: 'Operaciones relacionadas con restaurantes'
            },
            {
                name: 'Tables',
                description: 'Operaciones relacionadas con mesas'
            }
        ],
    },
    apis: [
        './src/menus/*.js',
        './src/restaurants/*.js',
        './src/tables/*.js',
    ]
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };