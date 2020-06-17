'use strict'

import express, { Request, Response, NextFunction } from 'express'
import jobRouter from './controllers/job'
import mongoose from 'mongoose'
import YAML from 'yamljs'
import path from 'path'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'

dotenv.config()

const app = express()

// server documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(YAML.load(path.resolve(__dirname, '../swagger.yaml'))))
app.use(cors())

// job API
app.use('/jobs', jobRouter())

// 404 handler
app.all('*', (_req, res, _next) => {
    res.status(404).json({
        errors: [ 'Not found' ]
    })
})

// error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
        errors: [ error.message ]
    })
});

const start = async () => {

    const mongoConnectionString = `mongodb://${process.env['COMMANDS_MONGO_HOST']}:${process.env['COMMANDS_MONGO_PORT']}/${process.env['COMMANDS_MONGO_DATABASE']}`

    await mongoose.connect(mongoConnectionString, {
        useNewUrlParser: true,
        bufferCommands: false,
        useUnifiedTopology: true,
        user: process.env['COMMANDS_MONGO_USER'],
        pass: process.env['COMMANDS_MONGO_PASSWORD'],
        useCreateIndex: true,
        autoIndex: false,
        autoCreate: true
    })

    mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err.message}`)
    })
    mongoose.connection.on('disconnected', () => { 
        console.error(`Disconnected from ${mongoConnectionString}`) 
    })
    mongoose.connection.on('reconnected', () => {
        console.info(`Reconnected to ${mongoConnectionString}`)
    })

    const port = process.env.PORT || 80

    app.listen(port, () => {
        console.log(`API is listening on port ${port}`)
    })
}

start().catch(console.error)