const app = require("../config")

app.get("/", (req, res) => {
   res.end(`API works on ${process.env.NODE_ENV}`)
})

//_________________________________________ auth ___________________________________________
var auth = require("./auth")
app.get("/refresh", auth.refresh)
app.post("/login", auth.login)
app.post("/logout", auth.logout)

//_________________________________________ user ___________________________________________
var users = require("./master/users")
app.get("/users", users.getAll)
app.get("/users/:id", users.getById)
app.post("/users", users.create)
app.put("/users", users.update)
app.delete("/users/:id", users.delete)










module.exports = app