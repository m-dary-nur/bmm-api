const { conn } = require("../config/database")
const { sign, verify } = require("../config/jwt")
const { dec } = require("../config/encryption")

exports.login = async (req, res) => {
   const form = req.body
   let db
   try {
      db = await conn.getConnection()
      const qClient = `	SELECT 
                           id, 
                           code,
                           name, 
                           email, 
                           phone,
                           address,
                           npwp,
                           logo
                        FROM clients
                        WHERE code = ?
                        AND active = 1`
      const resClient = await db.query(qClient, ["001"])
      const client = resClient[0]

      if (resClient.length > 0) {         
         const qUsername = `	SELECT 
                                 id,
                                 branchId,
                                 password
                                 FROM users
                              WHERE name = ?
                              AND clientId = ?
                              AND active = 1`
         const resUsername = await db.query(qUsername, [form.username, client.id])         

         if (resUsername.length > 0) {
            if (form.password === dec(resUsername[0].password)) {
               
               const qPersonal = `	SELECT
                                       id,
                                       name,
                                       fullname,
                                       email,
                                       phone,
                                       privileges
                                    FROM users
                                    WHERE id = ?`
               const resPersonal = await db.query(qPersonal, [resUsername[0].id])
               const personal = resPersonal[0]

               const qBranch = `	SELECT 
                              id,
                              name,
                              email,
                              phone,
                              address,
                              active         
                           FROM branches
                           WHERE id = ?
                           AND active = 1`
               const resBranch = await db.query(qBranch, [resUsername[0].branchId])
               const branch = resBranch[0]

               const token = sign({
                  client: client.id,
                  branch: branch.id,
                  user: personal.id,
                  logged: true,
               })

               const sqlUpdateToken = `UPDATE users SET token = ?, lastLogin = now() WHERE id = ?`
               db.query(sqlUpdateToken, [token, personal.id])

               const qMenu = `SELECT menus.*
										FROM menus
										INNER JOIN clients
											ON (JSON_CONTAINS(clients.menuIdArray, menus.id) OR menus.parentId = 0)
										WHERE clients.id = ?`
               const menus = await db.query(qMenu, [client.id])

               db.release()

               const privileges = JSON.parse(personal.privileges)
               const menuFilterUser = menus.filter(x => x.parentId === 0 || privileges.indexOf(x.id) !== -1)

               res.end(JSON.stringify({
                  success: true,
                  data: {
                     token,
                     client,
                     branch,
                     personal,
                     menus,
                     menu: menuFilterUser,
                  },
               }))
            } else {
               res.end(JSON.stringify({
                  success: false,
                  message: "Password tidak cocok dengan akun.",
               }))
            }
         } else {
            res.end(JSON.stringify({
               success: false,
               message: "Nama pengguna anda tidak terdaftar dalam sistem.",
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            messageError: "Kode registrasi anda tidak terdaftar dalam sistem.",
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

exports.refresh = async (req, res) => {
   let db
   try {
      if (req.headers["authorization"]) {
         const decode = verify(req.headers["authorization"])
         if (decode.logged) {
            db = await conn.getConnection()
            const qClient = `	SELECT 
										id, 
										name, 
										email, 
										phone, 
										address
									FROM clients
									WHERE id = ?
									AND active = 1`
            const resClient = await db.query(qClient, [decode.client])
            const client = resClient[0]
            if (resClient.length > 0) {
               const qPersonal = `	SELECT
                                       id,
                                       name,
                                       fullname,
                                       email,
                                       phone,
                                       privileges
                                    FROM users
                                    WHERE id = ?
                                    AND active = 1`
               const resPersonal = await db.query(qPersonal, [decode.user])
               const personal = resPersonal[0]

               const qBranch = `	SELECT 
                              id,
                              name,
                              email,
                              phone,
                              address,
                              active         
                           FROM branches
                           WHERE id = ?
                           AND active = 1`
               const resBranch = await db.query(qBranch, [decode.branch])
               const branch = resBranch[0]

               if (personal) {
                  const qMenu = `SELECT menus.*
                                 FROM menus
                                 INNER JOIN clients
                                    ON (JSON_CONTAINS(clients.menuIdArray, menus.id) OR menus.parentId = 0)
                                 WHERE clients.id = ?`
                  const menus = await db.query(qMenu, [decode.client])

                  db.release()

                  const privileges = JSON.parse(personal.privileges)
                  const menuFilterUser = menus.filter(x => x.parentId === 0 || privileges.indexOf(x.id) !== -1)

                  res.end(JSON.stringify({
                     success: true,
                     data: {
                        client,
                        branch,
                        personal,
                        menus,
                        menu: menuFilterUser,
                     },
                  }))
               } else {
                  res.end(JSON.stringify({
                     success: false,
                     message: "Sesi login anda telah berakhir.",
                  }))
               }
            } else {
               res.end(JSON.stringify({
                  success: false,
                  message: "Perusahaan tidak ditemukan dengan kode registrasi tersebut.",
               }))
            }
         } else {
            res.end(JSON.stringify({
               success: false,
               message: "Sesi login tidak valid.",
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login kedaluarsa, silahkan login ulang.",
         }))
      }
   } catch (err) {
      if (err.name === "Error") {
         res.end(JSON.stringify({
            success: false,
            message: "Missmatch Session Error.",
         }))
      } else {
         console.log("[sql error]", err)
         res.end(JSON.stringify({
            success: false,
            message: "Internal Error.",
            error: err,
         }))
         throw err
      }
   } finally {
      if (db) db.release()
   }
}

exports.logout = async (req, res) => {
   const form = req.body
   let db
   try {
      const decode = verify(req.headers["authorization"])
      if (decode.logged) {
         if (!form.loginAnotherDevice) {
            db = await conn.getConnection()
            const sql = `   UPDATE users
								SET token = null
								WHERE id = ? `
            const row = await db.query(sql, [decode.user])

            db.release()

            if (row.affectedRows > 0) {
               res.end(JSON.stringify({
                  success: true,
               }))
            } else {
               res.end(JSON.stringify({
                  success: false,
                  message: "terjadi kesalahan.",
               }))
            }
         } else {
            res.end(JSON.stringify({
               success: false,
            }))
         }
      } else {
         res.end(JSON.stringify({
            success: false,
            message: "Sesi login tidak valid.",
         }))
      }
   } catch (err) {
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
