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

app.use('/jobs', jobRouter())

app.all('*', (_req, res, _next) => {
    res.status(404).json({
        errors: [ 'Not found' ]
    })
})

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
        errors: [ error.message ]
    })
});

(async () => {

    console.log(process.env['COMMANDS_MONGO_PASSWORD'])
    
    await mongoose.connect(`mongodb://${process.env['COMMANDS_MONGO_HOST']}:${process.env['COMMANDS_MONGO_PORT']}/${process.env['COMMANDS_MONGO_DATABASE']}`, {
        useNewUrlParser: true,
        bufferCommands: false,
        useUnifiedTopology: true,
        user: process.env['COMMANDS_MONGO_USER'],
        pass: process.env['COMMANDS_MONGO_PASSWORD'],
        useCreateIndex: true,
        autoIndex: false,
        autoCreate: true
    })

    mongoose.connection.on('error', console.error)
    mongoose.connection.on('disconnected', console.error)
    mongoose.connection.on('reconnected', console.info)

    const port = process.env.PORT || 3000

    app.listen(port, () => {
        console.log(`API is listening on port ${port}`)
    })

})()

.catch(console.error)