const dotenv = require("dotenv")
dotenv.config()
const server = require("./routes")

var serverPort;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
   serverPort = 13131;
} else {
   serverPort = 3001;
}

server.listen(serverPort, () => {
   console.log(`=====================================\n API started on port ${serverPort} \n=====================================`)
})