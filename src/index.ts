'use strict'

import express, { Request, Response, NextFunction } from 'express'
import jobRouter from './controllers/job'
import mongoose from 'mongoose'
import YAML from 'yamljs'
import path from 'path'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import consul from 'consul'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'
import signals from './signals'
import statusRouter from './controllers/status'
import Amqp from './amqp'
import rpcRouter from './controllers/rpc'

dotenv.config()

const app = express()

app.use(cors())

// server documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(YAML.load(path.resolve(__dirname, '../swagger.yaml'))))

// APIs
app.use('/jobs', jobRouter())
app.use('/rpc', rpcRouter())
app.use('/status', statusRouter())


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
})

const initDb = async () => {

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
}

const register = async () => {

    const id = uuidv4()
    
    const client = consul({
        host: process.env['COMMANDS_CONSUL_HOST'],
        port: process.env['COMMANDS_CONSUL_PORT'],
        secure: false,
        defaults: {
            token: process.env['COMMANDS_CONSUL_TOKEN']
        },
        promisify: true
    })

    await client.agent.service.register({
        id,
        name: process.env['COMMANDS_CONSUL_SERVICE_NAME'],
        address: process.env['COMMANDS_CONSUL_SERVICE_HOST'],
        port: parseInt(process.env['COMMANDS_CONSUL_SERVICE_PORT'] as string),
        check: {
            http: `http://${process.env['COMMANDS_CONSUL_SERVICE_HOST']}:${process.env['COMMANDS_CONSUL_SERVICE_PORT']}/status`,
            interval: '5s',
            deregistercriticalserviceafter: '30s'
        }
    } as any)

    console.log(`Registered with ID ${id}`)

    for (const signal of signals){
        process.on(signal as any, async () => {
            
            try {
                await client.agent.service.deregister(id)
                console.log("Service was unregistered")
            } 
            
            catch (e){
                console.log(`Couldn't deregister service: ${e.message}`)
            } 
            
            finally {
                process.exit(-1)
            }
        })
    }
}

const listen = async () => {
    
    const port = 80

    app.listen(port, () => {
        console.log(`API is listening on port ${port}`)
    })
}

const start = async () => {
    await initDb()
    await register()
    await listen()
}

start().catch((err) => {
    console.error(err)
    process.exit(-1)
})