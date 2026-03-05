const { getConnection, sql } = require('../db');

async function createMessage(req, res, next) {
    try {
        const { id_nodo, mensaje } = req.body;
        const nodeId = Number(id_nodo);

        if (Number.isNaN(nodeId) || !mensaje || typeof mensaje !== 'string') {
            return res.status(400).json({ error: 'Invalid payload. Required: id_nodo, mensaje' });
        }

        const pool = await getConnection();
        const result = await pool
            .request()
            .input('id_nodo', sql.Int, nodeId)
            .input('mensaje', sql.NVarChar(sql.MAX), mensaje.trim())
            .query(`
        INSERT INTO Mensajes (id_nodo, mensaje)
        OUTPUT INSERTED.*
        VALUES (@id_nodo, @mensaje)
      `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        next(error);
    }
}

async function getMessagesByNode(req, res, next) {
    try {
        const nodeId = Number(req.params.node_id);

        if (Number.isNaN(nodeId)) {
            return res.status(400).json({ error: 'Invalid node id' });
        }

        const pool = await getConnection();
        const result = await pool.request().input('id_nodo', sql.Int, nodeId).query(`
      SELECT *
      FROM Mensajes
      WHERE id_nodo = @id_nodo
      ORDER BY id_mensaje DESC
    `);

        res.json(result.recordset);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createMessage,
    getMessagesByNode
};