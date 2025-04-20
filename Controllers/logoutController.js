const fs = require('fs').promises;
const path = require('path');

const userRepository = {
    usersList: require('../models/users.json'),
    updateUsers(newUsersList) {
        this.usersList = newUsersList;
    }
};

const logoutUser = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.sendStatus(204); // No content to return
    }

    const refreshToken = cookies.jwt;

    const userFound = userRepository.usersList.find(user => user.refreshToken === refreshToken);

    // If no matching refresh token, clear it on client and exit
    if (!userFound) {
        res.clearCookie('jwt', {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none',
            secure: true
        });
        return res.sendStatus(204);
    }

    // Remove the refresh token from the matched user
    const remainingUsers = userRepository.usersList.filter(user => user.refreshToken !== refreshToken);
    const updatedUser = { ...userFound, refreshToken: '' };

    userRepository.updateUsers([...remainingUsers, updatedUser]);

    // Write the updated users list back to the JSON file
    await fs.writeFile(
        path.join(__dirname, '..', 'models', 'users.json'),
        JSON.stringify(userRepository.usersList, null, 2)
    );

    // Clear the cookie from the client
    res.clearCookie('jwt', {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true
    });

    res.sendStatus(204);
};

module.exports = { logoutUser };
