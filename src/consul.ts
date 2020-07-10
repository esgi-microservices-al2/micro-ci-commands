'use strict'

import signals from "./signals"
import dns from 'dns'
import consul from 'consul'


export const registerToConsul = async () => {

    const ids: string[] = []

    const hostIp = (await dns.promises.lookup(process.env['COMMANDS_CONSUL_SERVICE_HOST'] as string)).address

    if (!hostIp)
        throw new Error('could not resolve host IP address')

    const fqdns = await dns.promises.reverse(hostIp)

    if (fqdns.length === 0)
        throw new Error('no FQDN found.')
    
    const client = consul({
        host: process.env['COMMANDS_CONSUL_HOST'],
        port: process.env['COMMANDS_CONSUL_PORT'],
        secure: false,
        defaults: {
            token: process.env['COMMANDS_CONSUL_TOKEN']
        },
        promisify: true
    })

    for (const fqdn of fqdns){

        ids.push(`micro-ci-commands-${ids.length}`)

        await client.agent.service.register({
            id: ids[ids.length - 1],
            tags: [
                'traefik.enable=true',
                'traefik.frontend.entryPoints=http',
                'traefik.frontend.rule=PathPrefix:/jobs'
            ],
            name: process.env['COMMANDS_CONSUL_SERVICE_NAME'] as string,
            address: fqdn,
            port: parseInt(process.env['COMMANDS_CONSUL_SERVICE_PORT'] as string),
            check: {
                http: `http://${fqdn}:${process.env['COMMANDS_CONSUL_SERVICE_PORT']}/status`,
                interval: '5s',
                deregistercriticalserviceafter: '30s'
            }
        } as any)

        console.log(`Registered service to Consul (ID ${ids[ids.length - 1]} for ${fqdn})`)
    }

    for (const signal of signals){
        process.on(signal, async () => {
            try {
                for (const id of ids){
                    await client.agent.service.deregister(id)
                    console.log(`Service ${id} was deregistered.`)
                }
            } catch (e){
                console.error(`Couldn't deregister service: ${e.message}.`)
            } finally {
                process.exit(-1)
            }
        })
    }
}

export default registerToConsul