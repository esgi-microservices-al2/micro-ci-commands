import { Router } from "express"

export function statusRouter (){
    const router = Router()

    router.get('/', (req, res) => {
        return res.end()
    })

    return router
}

export default statusRouter