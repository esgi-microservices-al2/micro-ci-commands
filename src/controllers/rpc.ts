'use strict'

import { Router } from "express"
import { jsonParser } from "./middlewares/parser"
import { asyncHandler } from "./controllerUtils"
import Job from "../models/Job"
import Amqp from '../amqp'
import os from 'os'

export function rpcRouter (){

    const router = Router()
    const amqp = Amqp.get()

    router.post("/:project/execute", jsonParser, asyncHandler(async(req, res) => {
        
        const job = await Job.findOne({ project: req.params.project })

        const commands = job instanceof Job ? job.script.map(command => [  command.program, ...command.arguments ]) : []

        res.json({
            message:  job ? 
                `Sent ${commands.length} commands for project ${req.params.project} to docker-runner` : 
                `No commands for project ${req.params.project} found, sending payload to docker-runner anyway.` 
        })

        const payload = { ...req.body, commands }

        console.log(`Sending payload to docker-runner: ${os.EOL.repeat(2)}${JSON.stringify(payload, null, 4)}`)
        
        amqp.send(payload)
        
        .catch((err) => {
            console.error(`Failed to send payload to docker-runner (${err.message})`)
        })
    }))

    return router
}

export default rpcRouter