db.createUser(
    {
        user: "commands",
        pwd: "commands",
        roles: [
            {
                role: "readWrite",
                db: "commands"
            }
        ]
    }
);