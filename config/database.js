var sql = require("mariadb")
var Listener = require("@m-dary-nur/sql-listener")

var host = "localhost"
var user = process.env.NODE_ENV === "development" ? "root" : "bmm_root"
var password = "n0madgen007"
var database = "bmm"
var port = 3306

//======================================================================================
var settings = {
   host,
   port,
   user,
   password,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
}
var conn = sql.createPool({ ...settings, database })
//======================================================================================

const masterTables = ["clients", "branches", "users", "taxtypes", "taxaccs", "taxconfs", "warehouses", "suppliers", "itemtypes", "itemgroups", "items"]
const purchaseTables = ["ppo", "ppodet", "po", "podet"]

var tables = [ ...masterTables, ...purchaseTables ]

var live = new Listener(settings, process.env.NODE_ENV === "development")
var livedb = async () => {
   var io = require("./io").io
   var connUsers = require("./io").connUsers

   live.listen(database, tables)
   live.on(database, function (e) {
      // console.log("[rows]", e.rows());
      // console.log("[==========================================================================]");
      // console.log("[rowsDiff]", e.rowsDiff());
      // console.log("[==========================================================================]");
      // console.log("[rows (with param 1)]", e.rows("clientId"));
      // console.log("[==========================================================================]");
      // console.log("[rowsDiff (with param 1)]", e.rowsDiff("clientId"));
      // console.log("[==========================================================================]");
      // console.log("[rows (with param 1 & 2)]", e.rows("clientId", "xid"));
      // console.log("[==========================================================================]");
      // console.log("[rowsDiff (with param 1 & 2)]", e.rowsDiff("clientId", "xid", "id"));
      const parameters = {
         event: e.event(),
         data: e.rowsDiff("", "", "id"),
      }

      if (e.table() === "clients") {
         const clientId = e.rowsDiff("id", "clientId").clientId
         io.sockets.to(`c_${clientId}`).emit(`stream ${e.table()}`, parameters)
      } else {
         const clientId = e.rowsDiff("clientId", "").clientId
         io.sockets.to(`c_${clientId}`).emit(`stream ${e.table()}`, parameters)
      }

      console.log("e.table()", e.table())
      if (e.table() === "users") {
         e.rowsDiff("", "", "id").map(x => {
            console.log("connUsers[`user_${x.id}`]", connUsers[`user_${x.id}`])
            if (connUsers[`user_${x.id}`]) {
               console.log("privileges in x", "privileges" in x)
               if ("privileges" in x) {
                  const ev = { ...x, privileges: JSON.parse(x.privileges) }
                  connUsers[`user_${x.id}`].emit("data personal updated", ev)
               } else {
                  connUsers[`user_${x.id}`].emit("data personal updated", x)
               }
            }
         })
      }
   })
   live.start()
}

setTimeout(() => livedb(), 1000)
// //======================================================================================

exports.conn = conn
