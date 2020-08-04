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
                        FROM items
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
         const query = `    SELECT *
                            FROM items
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
         const query = `call itemsCreate(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`         
         const result = await db.query(query, [
            form.itemGroupId,
            form.code,
            form.barcode || "",
            form.barcodeSupplier || "",
            form.name,
            form.alias || "",
            form.unit1,
            1,
            form.unit2 || "",
            parseFloat(form.ratio2) || 0,
            form.unit3 || "",
            parseFloat(form.ratio3) || 0,
            form.unitOther || "",
            form.model || "",
            form.color || "",
            form.weight || "",
            form.description || "",
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
               message: `Produk "${form.name}" berhasil dibuat`,
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
         const query = `call itemsUpdate(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`         
         const result = await db.query(query, [
            form.id,
            form.itemGroupId,
            form.code,
            form.barcode || "",
            form.barcodeSupplier || "",
            form.name,
            form.alias || "",
            form.unit1,
            1,
            form.unit2 || "",
            parseFloat(form.ratio2) || 0,
            form.unit3 || "",
            parseFloat(form.ratio3) || 0,
            form.unitOther || "",
            form.model || "",
            form.color || "",
            form.weight || "",
            form.description || "",
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
               message: `Produk "${form.name}" berhasil diperbarui`,
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
         const sql = `call itemsDelete(?,?)`
         const result = await db.query(sql, [param.id, decode.user])
         if (result[0][0].status === "ok") {
            res.end(JSON.stringify({
               success: true,
               message: `Produk "${send.label}" berhasil dihapus`,
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
