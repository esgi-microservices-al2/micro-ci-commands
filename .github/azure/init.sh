#!/bin/bash
set -e

mongo <<EOF
use commands
db.createUser({
  user:  'commands',
  pwd: '$COMMANDS_MONGO_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'commands'
  }]
})
EOF