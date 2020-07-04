# micro-ci-commands

This service is responsible for handling project's commands to be executed inside the micro-ci-docker-runner service.

## Consul configuration

In order to discover our endpoint from Consul, you must use the `microservice-commands` name.

## Communication from/to other microservices

The HTTP protocol scheme must be `http://`.

### From micro-ci-projects

When a build is triggered, micro-ci-projects service must send its data to this HTTP endpoint:

`POST /rpc/{projectId}/execute`

`Content-Type` must be `application/json`

The request body must be a JSON payload, it will be merged with the project's commands, if they are available (otherwise they will be substituted an empty array).

### To micro-ci-docker-runner

After receiving data from micro-ci-projects, the resulting message will be sent to RabbitMQ in the `al2.docker.runner.queue` queue.

The payload will be in JSON format and will look like this:

```
{
    "commands": [
        [ "echo", "Hello,", "World!" ],
        [ "uname", "-a" ],
        [ "exit" ],
    ]
    ... any data received from micro-ci-projects (path to project for example)
}
```

## API documentation

API documentation is available at /docs