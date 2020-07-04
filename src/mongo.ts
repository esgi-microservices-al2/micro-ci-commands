'use strict'

import mongoose from 'mongoose'

export const connectToDatabase = async () => {

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

export default connectToDatabase