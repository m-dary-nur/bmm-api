const { conn } = require("../../config/database")
const { verify } = require("../../config/jwt")
const { enc } = require("../../config/encryption")

//=============================================== getAll =====================================================
exports.getAll = async (req, res) => {
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()

         const query = `SELECT *
                        FROM warehouses
                        WHERE clientId = ? `
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
//=============================================== getById =====================================================
exports.getById = async (req, res) => {
   const param = req.params
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()
         const query = `	SELECT *
                           FROM warehouses
                           WHERE clientId = ?
                           AND id = ? `
         const result = await db.query(query, [decode.client, param.id])

         db.release()

         if (result.length > 0) {
            res.end(JSON.stringify({
               success: true,
               data: result[0],
            }))
         } else {
            res.end(JSON.stringify({
               success: true,
               data: {},
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
      console.log("[err]", err)
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

//=============================================== create =====================================================
exports.create = async (req, res) => {
   const form = req.body
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()
         const query = `call warehousesCreate(?,?,?,?,?,?,?)`         
         const result = await db.query(query, [
            form.name,
            form.description || "",
            (form.active ? 1 : 0),
            decode.client,
            form.branchId,
            decode.user,
            form.log,
         ])

         db.release()

         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Gudang "${form.name}" berhasil dibuat`,
            }))
         } else {
            res.end(JSON.stringify({
               success: false,
               message: result[0][0].status,
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
      console.log("[err]", err)
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

//=============================================== update =====================================================
exports.update = async (req, res) => {
   const form = req.body
   console.log(form)
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()
         const query = `call warehousesUpdate(?,?,?,?,?,?,?,?)`
         const result = await db.query(query, [            
            form.id,
            form.name,
            form.description || "",
            (form.active ? 1 : 0),
            decode.client,
            form.branchId,
            decode.user,
            form.log,
         ])

         db.release()

         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Gudang "${form.name}" berhasil diperbarui`,
            }))
         } else {
            res.end(JSON.stringify({
               success: false,
               message: result[0][0].status,
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
      console.log("[err]", err)
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

//=============================================== delete =====================================================
exports.delete = async (req, res) => {
   const param = req.params
   const send = req.query
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()
         const sql = `call warehousesDelete(?,?)`
         const result = await db.query(sql, [param.id, decode.user])
         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Gudang "${send.label}" berhasil dihapus`,
            }))
         } else {
            res.end(JSON.stringify({
               success: false,
               message: result[0][0].status,
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
      console.log("[err]", err)
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
