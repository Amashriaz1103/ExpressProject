const userDB = {
    users: require('../models/users.json'),
    setUsers: function (data) {
        this.users = data
    }
}

const fsPromises = require('fs').promises;
const path = require('path')
const bcrypt = require('bcryptjs');

const handleNewUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "username and password required" })

    const duplicate = userDB.users.find(
        user => user.username == username
    )
    if (duplicate)
        return res.sendStatus(409)//conflict
    try {
        const hashedPass = await bcrypt.hash(password, 10)
        const newUser = {
            username,
            "roles":{
            "user":2001
            },
            password:hashedPass
        }
        userDB.setUsers([...userDB.users,newUser])
        await fsPromises.writeFile(path.join(__dirname,'..','models','users.json'),JSON.stringify(userDB.users))
        res.status(201).json({message:"User created"});
    }
    catch (error) {
        res.status(500).json({message:error.message});
    }
}

module.exports ={handleNewUser}