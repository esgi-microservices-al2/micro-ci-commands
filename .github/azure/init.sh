#!/bin/bash
set -e

echo "123" > /tmp/test
echo $COMMANDS_MONGO_PASSWORD > /tmp/testPWD

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