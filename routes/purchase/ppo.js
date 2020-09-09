const { conn } = require("../../config/database")
const { verify } = require("../../config/jwt")

//=============================================== getAll =====================================================
exports.getAll = async (req, res) => {
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()

         const query = `SELECT 
                           id,
                           clientId,
                           branchId,
                           no,
                           DATE_FORMAT(date, '%Y-%m-%d') date,
                           ref,
                           description,
                           status
                        FROM ppo
                        WHERE clientId = ?`
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
//=============================================== getAllDet =====================================================
exports.getAllDet = async (req, res) => {
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         db = await conn.getConnection()

         const query = `SELECT 
                           id,
                           clientId,
                           branchId,
                           ppoId,
                           itemId,
                           DATE_FORMAT(dateRequired, '%Y-%m-%d') AS dateRequired,
                           qty,
                           ratio,
                           unit,
                           description
                        FROM ppodet
                        WHERE clientId = ?`
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
                           FROM ppo
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
         const query = `call ppoCreate(?,?,?,?,?,?,?,?)`  
         const result = await db.query(query, [
            form.date,
            form.ref,
            form.description || '',
            JSON.stringify(form.detail) || '[]',
            decode.client,
            decode.branch,
            decode.user,
            form.log,
         ])

         db.release()

         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Pre Order Pembelian "${result[0][0].no}" berhasil dibuat`,
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
         const query = `call ppoUpdate(?,?,?,?,?,?,?,?)`
         const result = await db.query(query, [            
            form.id,
            form.ref,
            form.description || '',
            JSON.stringify(form.detail) || '[]',
            decode.client,
            decode.branch,
            decode.user,
            form.log,
         ])

         db.release()

         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Pre Order Pembelian "${result[0][0].no}" berhasil diperbarui`,
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
         const sql = `call ppoDelete(?,?)`
         const result = await db.query(sql, [param.id, decode.user])
         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Pre Order Pembelian "${send.label}" berhasil dihapus`,
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
