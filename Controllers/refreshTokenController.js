const userDB = {
    users: require("../models/users.json"),
    setUsers: function (data) {
      this.users = data;
    },
  };
  
  const jwt = require("jsonwebtoken");
  require("dotenv").config();
  
  const handleRefreshToken = (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;
    const foundUser = userDB.users.find(
      (person) => person.refreshToken === refreshToken,
    );
    if (!foundUser) return res.sendStatus(401);
  
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || foundUser.username !== decoded.username)
        return res.sendStatus(401);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: Object.values(foundUser.roles),
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "120s" },
      );
      res.json({ accessToken });
    });
  };
  
  module.exports = { handleRefreshToken };
  