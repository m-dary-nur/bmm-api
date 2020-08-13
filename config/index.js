const polka = require("polka")
var cors = require("cors")
var queryParser = require("connect-query")
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")

const app = polka()
app.parse = require("@polka/url")



app.use(
   cors({
      origin: [
         "http://localhost:5000",
         "http://localhost:13131",
         "http://localhost:3001",
         "https://cv-bmm.site:13131",
         "https://cv-bmm.site:3001",
         "https://cv-bmm.site",
         "wss://cv-bmm.site:13131",
         "https://bintangmitramulia.netlify.app",
      ],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
   })
)
app.use(queryParser())
app.use(cookieParser())
app.use(bodyParser.json())
app.use((req, res, next) => {
   // res.setHeader('Set-Cookie', 'SameSite=Strict;Secure')
   req.io = require("./io").io
   req.connUsers = require("./io").connUsers
   return next()
})

module.exports = app