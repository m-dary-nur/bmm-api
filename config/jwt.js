const jwt = require("jsonwebtoken");

const jwtkey = "muhammadevanozaflanalfarezel";

exports.sign = (payload) =>
   jwt.sign(payload, jwtkey, {
      expiresIn: 86400, // expires in 24 hours
      subject: Date.now().toString(),
   });

exports.verify = (token) => {
   const tokenClearBearer = token.split(" ")[1];
   return jwt.verify(tokenClearBearer, jwtkey, {
      ignoreExpiration: true,
   });
};
