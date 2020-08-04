const app = require("../config")

app.get("/", (req, res) => {
   res.end(`API works on ${process.env.NODE_ENV}`)
})

//_________________________________________ auth ___________________________________________
var auth = require("./auth")
app.get("/refresh", auth.refresh)
app.post("/login", auth.login)
app.post("/logout", auth.logout)

//_________________________________________ branches ___________________________________________
var branches = require("./master/branches")
app.get("/branches", branches.getAll)
app.get("/branches/:id", branches.getById)
app.post("/branches", branches.create)
app.put("/branches", branches.update)
app.delete("/branches/:id", branches.delete)

//_________________________________________ users ___________________________________________
var users = require("./master/users")
app.get("/users", users.getAll)
app.get("/users/:id", users.getById)
app.post("/users", users.create)
app.put("/users", users.update)
app.delete("/users/:id", users.delete)

//_________________________________________ taxtypes ___________________________________________
var staticdata = require("./master/_staticdata")
app.get("/taxtypes", staticdata.taxtypes)
app.get("/itemtypes", staticdata.itemtypes)

//_________________________________________ taxaccs ___________________________________________
var taxaccs = require("./master/taxaccs")
app.get("/taxaccs", taxaccs.getAll)
app.get("/taxaccs/:id", taxaccs.getById)
app.post("/taxaccs", taxaccs.create)
app.put("/taxaccs", taxaccs.update)
app.delete("/taxaccs/:id", taxaccs.delete)

//_________________________________________ taxconfs ___________________________________________
var taxconfs = require("./master/taxconfs")
app.get("/taxconfs", taxconfs.getAll)
app.get("/taxconfs/:id", taxconfs.getById)
app.post("/taxconfs", taxconfs.create)
app.put("/taxconfs", taxconfs.update)
app.delete("/taxconfs/:id", taxconfs.delete)

//_________________________________________ warehouses ___________________________________________
var warehouses = require("./master/warehouses")
app.get("/warehouses", warehouses.getAll)
app.get("/warehouses/:id", warehouses.getById)
app.post("/warehouses", warehouses.create)
app.put("/warehouses", warehouses.update)
app.delete("/warehouses/:id", warehouses.delete)

//_________________________________________ suppliers ___________________________________________
var suppliers = require("./master/suppliers")
app.get("/suppliers", suppliers.getAll)
app.get("/suppliers/:id", suppliers.getById)
app.post("/suppliers", suppliers.create)
app.put("/suppliers", suppliers.update)
app.delete("/suppliers/:id", suppliers.delete)

//_________________________________________ itemgroups ___________________________________________
var itemgroups = require("./master/itemgroups")
app.get("/itemgroups", itemgroups.getAll)
app.get("/itemgroups/:id", itemgroups.getById)
app.post("/itemgroups", itemgroups.create)
app.put("/itemgroups", itemgroups.update)
app.delete("/itemgroups/:id", itemgroups.delete)

//_________________________________________ items ___________________________________________
var items = require("./master/items")
app.get("/items", items.getAll)
app.get("/items/:id", items.getById)
app.post("/items", items.create)
app.put("/items", items.update)
app.delete("/items/:id", items.delete)










module.exports = app