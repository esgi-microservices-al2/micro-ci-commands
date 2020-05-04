import { json } from 'express'

export const jsonParser = json({
    limit: '10kb',
    strict: true
})