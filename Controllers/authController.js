const userDB = {
    users: require('../models/users.json'),
    setUsers: function (data) {
        this.users = data
    }
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const fsPromises = require('fs').promises;
const path = require('path');


const handleLogin = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password)
        res.status(400).json({ message: "username and password required" })
    const foundUser = userDB.users.find(user => user.username === username)
    if (!foundUser)
        return res.status(401).json({ message: "User not found" });
    const match = await bcrypt.compare(password, foundUser.password)
    if (match) {
        const roles = Object.values(foundUser.roles)
        const accessToken = jwt.sign(
            { 
                "UserInfo":{
                    "username":foundUser.username,
                    "roles":roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        )
        const refreshToken = jwt.sign(
            { 'username': foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        )
        const otherUsers = userDB.users.filter(person => person.username !== username)
        const currentUser = { ...foundUser, refreshToken }
        userDB.setUsers([...otherUsers, currentUser])
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'models', 'users.json'),
            JSON.stringify(userDB.users)
        )
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 ,samesite:'none',secure:true})
        res.json({ accessToken })
    }
    else
        res.sendStatus(401)
}

module.exports = { handleLogin }