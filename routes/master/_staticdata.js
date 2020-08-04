const { conn } = require("../../config/database")
const { verify } = require("../../config/jwt")
const { enc } = require("../../config/encryption")

//=============================================== taxtypes =====================================================
exports.taxtypes = async (req, res) => {
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()

         const query = `SELECT *
                        FROM taxtypes `
         const result = await db.query(query, [decode.client])

         db.release()

         if (result.length > 0) {
            res.end(JSON.stringify({
               success: true,
               data: result,
            }))
         } else {
            res.end(JSON.stringify({
               success: true,
               data: [],
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
      console.log(err)
      res.end(JSON.stringify({
         success: false,
         message: "Internal Error.",
         error: err,
      }))
      throw err
   } finally {
      if (db) db.release()
   }
}
//=============================================== itemtypes =====================================================
exports.itemtypes = async (req, res) => {
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()

         const query = `SELECT *
                        FROM itemtypes `
         const result = await db.query(query, [decode.client])

         db.release()

         if (result.length > 0) {
            res.end(JSON.stringify({
               success: true,
               data: result,
            }))
         } else {
            res.end(JSON.stringify({
               success: true,
               data: [],
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
      console.log(err)
      res.end(JSON.stringify({
         success: false,
         message: "Internal Error.",
         error: err,
      }))
      throw err
   } finally {
      if (db) db.release()
   }
}