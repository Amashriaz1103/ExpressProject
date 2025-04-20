const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userDatabase = {
    usersList: require('../models/users.json'),
    updateUsers(updatedList) {
        this.usersList = updatedList;
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Search for user
    const foundUser = userDatabase.usersList.find(u => u.username === username);
    if (!foundUser) {
        return res.status(401).json({ message: "User not found" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) return res.sendStatus(401);

    // Generate JWT tokens
    const userRoles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
        {
            UserInfo: {
                username: foundUser.username,
                roles: userRoles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
    );

    const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    // Update user with new refresh token
    const remainingUsers = userDatabase.usersList.filter(u => u.username !== username);
    const updatedUserData = { ...foundUser, refreshToken };
    userDatabase.updateUsers([...remainingUsers, updatedUserData]);

    // Write changes to file
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'models', 'users.json'),
        JSON.stringify(userDatabase.usersList, null, 2)
    );

    // Set refresh token cookie and send access token
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
};

module.exports = { loginUser };
