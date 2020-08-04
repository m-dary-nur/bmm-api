var { server } = require("./index")
var options = {
   // transports: ["websocket", "polling"], (error)
   path: "/socket.io",
   serveClient: true,
   // below are engine.IO options
   pingInterval: 25000, //was 10k, how many ms before sending a new ping packet, => how often to send a ping
   pingTimeout: 30000, //should be above 30k to fix disconnection issue how many ms without a pong packet to consider the connection closed
   upgradeTimeout: 20000, // default value is 10000ms, try changing it to 20k or more
   origins: "*:*",
   agent: false,
   cookie: false,
   rejectUnauthorized: false,
   reconnectionDelay: 1000,
   reconnectionDelayMax: 5000,
   maxHttpBufferSize: 100000000, //100 mb
}
var io = require("socket.io")(server, options)

var connUsers = {}

io.on("connection", (socket) => {
   // notice user connected and add to corp & b room
   socket.on("user connected", (param) => {
      connUsers[`user_${param.user}`] = socket

      socket.myclient = param.client
      socket.mybranch = param.branch
      socket.myuser = param.user

      socket.join(`c_${param.client}`)
      socket.join(`b_${param.branch}`)

      socket.broadcast.to(`c_${param.client}`).emit("user connected", param)
   })

   // handle logout / refresh for disconnect
   socket.on("disconnect", () => {
      socket.broadcast.to(`c_${socket.myclient}`).emit("socket disconnected", {
         corp: socket.myclient,
         user: socket.myuser,
      })
      delete connUsers[`user_${socket.myuser}`]
      socket.disconnect()
   })
   socket.on("logout", () => {
      socket.broadcast.to(`c_${socket.myclient}`).emit("socket disconnected", {
         corp: socket.myclient,
         user: socket.myuser,
      })
      delete connUsers[`user_${socket.myuser}`]
      socket.disconnect()
   })
   socket.on("logout for other device", () => {
      socket.broadcast.to(`c_${socket.myclient}`).emit("user disconnected", {
         client: socket.myclient,
         branch: socket.mybranch,
         user: socket.myuser,
      })
   })
})

exports.io = io
exports.connUsers = connUsers
