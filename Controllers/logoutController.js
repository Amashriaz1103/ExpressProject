const { promises: fs } = require('fs');
const path = require('path');

const userDatabase = {
    usersList: require('../models/users.json'),
    updateUserList(updatedUsers) {
        this.usersList = updatedUsers;
    }
};

const logoutUser = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.sendStatus(204); // No content
    }

    const refreshToken = cookies.jwt;

    // Check if the user exists with this refresh token
    const userFound = userDatabase.usersList.find(user => user.refreshToken === refreshToken);

    if (!userFound) {
        res.clearCookie('jwt', {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none',
            secure: true
        });
        return res.sendStatus(204);
    }

    // Remove refresh token and update the list
    const updatedUserList = userDatabase.usersList.filter(user => user.refreshToken !== refreshToken);
    const updatedUser = { ...userFound, refreshToken: '' };
    userDatabase.updateUserList([...updatedUserList, updatedUser]);

    await fs.writeFile(path.join(__dirname, '..', 'models', 'users.json'), JSON.stringify(userDatabase.usersList, null, 2));

    // Clear the cookie from the client's browser
    res.clearCookie('jwt', {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true
    });

    res.sendStatus(204);
};

module.exports = { logoutUser };
