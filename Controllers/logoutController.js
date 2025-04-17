const userDB = {
    users: require('../models/users.json'),
    setUsers: function (data) {
        this.users = data
    }
}

const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content to send back
    
    const refreshToken = cookies.jwt;

    const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 ,samesite:'none',secure:true});
        return res.sendStatus(204);
    }

    const otherUsers = userDB.users.filter(person => person.refreshToken !== refreshToken);
    const currentUser = { ...foundUser, refreshToken: '' };
    userDB.setUsers([...otherUsers, currentUser]);
    
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'models', 'users.json'),
        JSON.stringify(userDB.users)
    );

    res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 ,samesite:'none',secure:true});
    res.sendStatus(204);
}

module.exports = { handleLogout };