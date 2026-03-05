const { getConnection, sql } = require('../db');

async function getAllNodes(req, res, next) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
      SELECT
        id_nodo,
        nombre_nodo,
        ip,
        sistema_operativo,
        estado,
        ultimo_reporte
      FROM Nodos
      ORDER BY id_nodo
    `);

        res.json(result.recordset);
    } catch (error) {
        next(error);
    }
}

async function getNodeById(req, res, next) {
    try {
        const nodeId = Number(req.params.id);

        if (Number.isNaN(nodeId)) {
            return res.status(400).json({ error: 'Invalid node id' });
        }

        const pool = await getConnection();

        const nodeResult = await pool.request().input('id_nodo', sql.Int, nodeId).query(`
      SELECT
        id_nodo,
        nombre_nodo,
        ip,
        sistema_operativo,
        estado,
        ultimo_reporte
      FROM Nodos
      WHERE id_nodo = @id_nodo
    `);

        if (nodeResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Node not found' });
        }

        const disksResult = await pool.request().input('id_nodo', sql.Int, nodeId).query(`
      SELECT *
      FROM Discos
      WHERE id_nodo = @id_nodo
      ORDER BY id_disco
    `);

        res.json({
            ...nodeResult.recordset[0],
            discos: disksResult.recordset
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllNodes,
    getNodeById
};