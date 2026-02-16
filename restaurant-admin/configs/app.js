'use strict'

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js'; 
import { dbConnection } from './db.configuration.js';
import restaurantRoutes from '../src/restaurants/restaurant.routes.js';
import tableRoutes from '../src/tables/table.routes.js';
import menuRoutes from '../src/menus/menu.routes.js';

const BASE_PATH = '/restaurantAdmin/v1';

const routes = (app) => {
    app.use(`${BASE_PATH}/restaurants`, restaurantRoutes)
    app.use(`${BASE_PATH}/tables`, tableRoutes)
    app.use(`${BASE_PATH}/menus`, menuRoutes)
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'FoodPilot restaurant Admin Server',
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            succes: false,
            message: 'Endpoint no encontrado'
        })
    })
}

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1)

    try {
        middlewares(app);
        await dbConnection();
        routes(app);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check available at: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    } catch (err) {
        console.error(`FoodPilot - Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
}