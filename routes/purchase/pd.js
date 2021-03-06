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

         const query = `SELECT 
                           id,
                           clientId,
                           branchId,
                           poId,
                           supplierId,
                           warehouseId,
                           no,
                           date,
                           ref,
                           description,
                           status
                        FROM pd
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
                           pdId,
                           podetId,
                           itemId,
                           qty,
                           ratio,
                           unit,
                           price,
                           total,
                           description
                        FROM pddet
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
                           FROM pd
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
         const query = `call pdCreate(?,?,?,?,?,?,?,?,?,?,?)`  
         const result = await db.query(query, [
            form.poId || 0,
            form.supplierId,
            form.warehouseId,
            form.date,
            form.ref || '',
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
               message: `Penerimaan Pembelian "${result[0][0].no}" berhasil dibuat`,
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
         const query = `call pdUpdate(?,?,?,?,?,?,?,?,?)`
         const result = await db.query(query, [            
            form.id,
            form.date,
            form.ref || '',
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
               message: `Penerimaan Pembelian "${result[0][0].no}" berhasil diperbarui`,
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
         const sql = `call pdDelete(?,?)`
         const result = await db.query(sql, [param.id, decode.user])
         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Penerimaan Pembelian "${send.label}" berhasil dihapus`,
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
