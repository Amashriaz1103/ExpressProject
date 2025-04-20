const userDatabase = {
  usersList: require("../models/users.json"),
  updateUsers: function (newData) {
      this.usersList = newData;
  },
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

const refreshTokenHandler = (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  console.log(cookies.jwt);
  const refreshToken = cookies.jwt;
  const user = userDatabase.usersList.find(
      (individual) => individual.refreshToken === refreshToken
  );
  
  if (!user) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error || user.username !== decoded.username) return res.sendStatus(401);
      
      const newAccessToken = jwt.sign(
          {
              UserInfo: {
                  username: user.username,
                  roles: Object.values(user.roles),
              },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "120s" }
      );
      
      res.json({ accessToken: newAccessToken });
  });
};

module.exports = { refreshTokenHandler };
