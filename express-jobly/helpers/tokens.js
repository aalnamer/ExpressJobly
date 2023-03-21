const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.isAdmin !== undefined,
    "createToken passed user without isAdmin property"
  );

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };

// "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjc5MjgzNjMzfQ.orD1VoH2LV8PhXFzKLwQtC7Evkft3RHdANYGlyWKLi8"
