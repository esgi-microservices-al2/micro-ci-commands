'use strict'

import { Schema, model, Document, Model } from "mongoose"

interface ICommand {
    program: string
    arguments: string[]
}

export interface IJob extends Document {
    script: ICommand[]
    project: string
}

export interface IJobModel extends Model<IJob> { }

const jobSchema = new Schema(
    {
        script: [{

            program: {
                type: String,
                required: true,
                trim: true
            },

            arguments: {
                type: [String],
                required: true,
                trim: true
            },

            _id: false
        }],

        project: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    {
        bufferCommands: false,
        timestamps: true
    }
)

export const Job = model<IJob, IJobModel>('Job', jobSchema)

export default Job