const { promises: fs } = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const userDatabase = {
    usersList: require('../models/users.json'),
    updateUserList(updatedUsers) {
        this.usersList = updatedUsers;
    }
};

const registerNewUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = userDatabase.usersList.find(user => user.username === username);
    if (existingUser) {
        return res.sendStatus(409); // Conflict
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            roles: { user: 2001 },
            password: hashedPassword
        };

        userDatabase.updateUserList([...userDatabase.usersList, newUser]);
        await fs.writeFile(path.join(__dirname, '..', 'models', 'users.json'), JSON.stringify(userDatabase.usersList, null, 2));

        res.status(201).json({ message: "User successfully created" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerNewUser };
