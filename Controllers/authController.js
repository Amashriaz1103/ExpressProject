const { promises: fs } = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userDatabase = {
    usersList: require('../models/users.json'),
    updateUserList(updatedUsers) {
        this.usersList = updatedUsers;
    }
};

const authenticateUser = async (req, res) => {
    const { username, password } = req.body;

    // Check for missing fields
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Find the user
    const user = userDatabase.usersList.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.sendStatus(401);

    // Generate tokens
    const accessToken = jwt.sign(
        { UserInfo: { username: user.username, roles: Object.values(user.roles) } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
    );

    const refreshToken = jwt.sign({ username: user.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

    // Store the refresh token
    const updatedUserList = userDatabase.usersList.filter(u => u.username !== username);
    const updatedUser = { ...user, refreshToken };
    userDatabase.updateUserList([...updatedUserList, updatedUser]);

    await fs.writeFile(path.join(__dirname, '..', 'models', 'users.json'), JSON.stringify(userDatabase.usersList, null, 2));

    // Set refresh token cookie
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
};

module.exports = { authenticateUser };
