'use strict'

import express, { Request, Response, NextFunction } from 'express'
import jobRouter from './controllers/job'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use('/job', jobRouter())

app.all('*', (req, res, next) => {
    res.status(404).json({
        errors: [ 'Not found' ]
    })
})

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        errors: [ error.message ]
    })
});

(async () => {
    
    await mongoose.connect(`mongodb://${process.env['MONGO_HOST']}:${process.env['MONGO_PORT']}/${process.env['MONGO_DATABASE']}`, {
        useNewUrlParser: true,
        bufferCommands: false,
        useUnifiedTopology: true,
        user: process.env['MONGO_USER'],
        pass: process.env['MONGO_PASSWORD'],
        useCreateIndex: true,
        autoIndex: false,
        autoCreate: true
    })

    mongoose.connection.on('error', console.error)
    mongoose.connection.on('disconnected', console.error)
    mongoose.connection.on('reconnected', console.info)

    const port = process.env.PORT || 80

    app.listen(port, () => {
        console.log(`API is listening on port ${port}`)
    })

})()

.catch(console.error)