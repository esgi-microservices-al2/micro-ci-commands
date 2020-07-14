'use strict'

import express, { Request, Response, NextFunction } from 'express'
import jobRouter from './controllers/job'
import YAML from 'yamljs'
import path from 'path'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import statusRouter from './controllers/status'
import rpcRouter from './controllers/rpc'
import registerToConsul from './consul'
import connectToDatabase from './mongo'

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
        errors: [ process.env['NODE_ENV'] === 'development' ? error.message : 'Internal server error' ]
    })
    console.error(error)
})

const start = async () => {
    
    await connectToDatabase()
    await registerToConsul()
    
    const port = 80
    app.listen(port, () => {
        console.log(`API is listening on port ${port}`)
    })
}

start()

.catch((err) => {
    console.error(err)
    process.exit(-1)
})