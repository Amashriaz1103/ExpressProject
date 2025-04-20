const userDatabase = {
    usersList: require('../models/users.json'),
    updateUsers: function (newData) {
        this.usersList = newData;
    }
};

const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const registerNewUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username and password are required" });

    const existingUser = userDatabase.usersList.find(
        user => user.username === username
    );
    if (existingUser)
        return res.sendStatus(409); // Conflict

    try {
        const encryptedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            roles: {
                user: 2001
            },
            password: encryptedPassword
        };

        userDatabase.updateUsers([...userDatabase.usersList, newUser]);
        await fsPromises.writeFile(path.join(__dirname, '..', 'models', 'users.json'), JSON.stringify(userDatabase.usersList));
        
        res.status(201).json({ message: "User successfully created" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerNewUser };
