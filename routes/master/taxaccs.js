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
                        FROM taxaccs
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
                           FROM taxaccs
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
         const query = `call taxaccsCreate(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`         
         const result = await db.query(query, [
            (form.isBankAcc ? 1 : 0),
            form.no,
            form.name,
            form.taxTypeId,
            form.taxAccParentId || 0,
            form.bankName || "",
            form.bankNo || "",
            form.bankAn || "",
            form.bankAddress || "",
            (form.active ? 1 : 0),
            decode.client,
            decode.branch,
            decode.user,
            form.log,
         ])

         db.release()

         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Akun pajak "${form.name}" berhasil dibuat`,
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
         const query = `call taxaccsUpdate(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
         const result = await db.query(query, [            
            form.id,
            (form.isBankAcc ? 1 : 0),
            form.no,
            form.name,
            form.taxTypeId,
            form.taxAccParentId || 0,
            form.bankName || "",
            form.bankNo || "",
            form.bankAn || "",
            form.bankAddress || "",
            (form.active ? 1 : 0),
            decode.client,
            decode.branch,
            decode.user,
            form.log,
         ])

         db.release()

         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Akun pajak "${form.name}" berhasil diperbarui`,
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
         const sql = `call taxaccsDelete(?,?)`
         const result = await db.query(sql, [param.id, decode.user])
         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Akun pajak "${send.label}" berhasil dihapus`,
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
