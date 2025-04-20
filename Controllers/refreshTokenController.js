const jwt = require('jsonwebtoken');
require('dotenv').config();

const refreshAccessToken = (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.sendStatus(401); // Unauthorized
    }

    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        const accessToken = jwt.sign(
            { UserInfo: { username: decoded.username } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );

        res.json({ accessToken });
    });
};

module.exports = { refreshAccessToken };
