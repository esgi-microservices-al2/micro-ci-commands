'use strict'

import amqp, { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager'
import { ConfirmChannel } from 'amqplib'

export class Amqp {
    
    private connection: AmqpConnectionManager
    private channel: ChannelWrapper
    
    private static instance: Amqp

    public constructor (){
        
        const user = encodeURIComponent(process.env['COMMANDS_RABBITMQ_USERNAME'] as string)
        const password = encodeURIComponent(process.env['COMMANDS_RABBITMQ_PASSWORD'] as string)
        const host = process.env['COMMANDS_RABBITMQ_HOST']
        const port = process.env['COMMANDS_RABBITMQ_PORT']

        this.connection = amqp.connect([`amqp://${user}:${password}@${host}:${port}`])

        this.connection.on('connect', ({url}) => {
            console.log(`successfully connected to amqp broker.`)
        })

        this.connection.on('disconnect', ({err}) => {
            console.log(`disconnected from an AMQP broker (${err.message})`)
        })

        this.channel = this.connection.createChannel({ 
            json: true,
            setup: (ch: ConfirmChannel) => {
                return ch.checkQueue(this.getQueueName())
            }
        })
    }

    public static get (): Amqp {
        if (!(Amqp.instance  instanceof Amqp))
            Amqp.instance = new Amqp()
        return Amqp.instance
    }

    public async send (message: any) {
        await this.channel.sendToQueue(this.getQueueName(), message)
    }

    private getQueueName = () => process.env['COMMANDS_RABBITMQ_QUEUE'] as string
} 

export default Amqp