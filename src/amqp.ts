'use strict'

import amqp, { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager'

export class AmqpClient {
    
    private connection: AmqpConnectionManager
    private channel: ChannelWrapper
    
    private static instance: AmqpClient

    public constructor (){
        
        const user = process.env['COMMANDS_RABBITMQ_USERNAME']
        const password = encodeURIComponent(process.env['COMMANDS_RABBITMQ_PASSWORD'] as string)
        const host = process.env['COMMANDS_RABBITMQ_HOST']
        const port = process.env['COMMANDS_RABBITMQ_PORT']

        this.connection = amqp.connect([`amqp://${user}:${password}@${host}:${port}`])

        this.connection.on('connect', ({url}) => {
            console.log(`successfully connected to ${url}`)
        })

        this.connection.on('disconnect', ({err}) => {
            console.log(`disconnected from an AMQP broker (${err.message})`)
        })

        this.channel = this.connection.createChannel()
    }

    public static get (): AmqpClient {
        if (!(AmqpClient.instance  instanceof AmqpClient))
            AmqpClient.instance = new AmqpClient()
        return AmqpClient.instance
    }

    public async send (buff: Buffer) {
        await this.channel.sendToQueue(process.env['COMMANDS_RABBITMQ_QUEUE'] as string, buff)
    }
}

export default AmqpClient