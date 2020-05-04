'use strict'

import { Router, RequestHandler, Request, Response, NextFunction } from "express"

export const asyncHandler = (asyncLogic: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler => {
    return (req, res, next) => {
        asyncLogic(req, res, next)
        .catch((err) => {
            next(err)
        })
    }
}

export default { 
    asyncHandler 
}