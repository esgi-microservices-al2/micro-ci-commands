"use strict"

import { Router } from "express"
import { asyncHandler } from './controllerUtils'
import Job from '../models/Job'
import { jsonParser } from "./middlewares/parser"
import AmqpClient from "../amqp"

export function jobRouter (){

    const router = Router()

    router.get("/", asyncHandler(async (req, res) => {
        
        const jobs = await Job.find(req.query)
        
        return res.json({
            data: jobs.map(j => j.toJSON())
        })

    }))

    router.get("/:id", asyncHandler(async (req, res) => {
        
        const job = await Job.findById(req.params.id)

        if (!job)
            return res.status(404).json({
                errors: [ 'Not found' ]
            })

        return res.json({
            data: job.toJSON()
        })

    }))

    router.post("/", jsonParser, asyncHandler(async (req, res) => {

        if (await Job.findOne({ project: req.body.project}) !== null)
            return res.status(403).json({
                errors: [ 'Job already exists for this project' ]
            })
        
        const job = new Job(req.body)

        const saved = await job.save()

        res.location(`/job/${saved._id}`)

        return res.status(201).json({
            data: saved.toJSON()
        })
    }))

    router.post("/:id/command", jsonParser, asyncHandler(async (req, res) => {

        const job = await Job.findById(req.params.id)

        if (!job)
            return res.status(404).json({
                errors: [ 'Not found' ]
            })

        job.script.push(req.body)

        const saved = await job.save()

        return res.status(200).json({
            data: saved.toJSON()
        })
    }))

    router.delete("/:id", asyncHandler(async (req, res) => {
        
        const deleted = await Job.findByIdAndDelete(req.params.id)

        if (!deleted)
            return res.status(404).json({
                errors: [ 'Not found' ]
            })
        

        return res.status(204).end()
    }))

    router.patch("/:id", jsonParser, asyncHandler(async (req, res) => {

        const existing = await Job.findById(req.params.id)

        if (!existing)
            return res.status(404).json({
                errors: [ 'Not found' ]
            })

        for (const [key, value] of Object.entries(req.body)){
            (existing as any)[key] = value
        }

        const updated = await existing.save()
        res.location(`/job/${updated._id}`)

        return res.status(200).json({
            data: updated.toJSON()
        })
        
    }))

    /* 
        Message format for sending commands to docker-runner:

        { "repositoryPath": "/path/to/repository" }
    
    */
    router.post("/:project/execute", jsonParser, asyncHandler(async(req, res) => {
        
        const job = await Job.findOne({ project: req.params.project })

        if (!job)
            return res.status(404).json({
                errors: [ `No job found for project ${req.params.project}` ]
            })
        
        AmqpClient.get().send(Buffer.from(JSON.stringify({
            ...req.body,
            project: job.project,
            commands: job.script.map(command => `${command.program} ${command.arguments.join(' ')}`)
        })))
        
        .catch(console.error)

        return res.end()
    }))

    return router
}

export default jobRouter