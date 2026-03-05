const { getConnection, sql } = require('../db');

const latestMetricsCte = `
  WITH LatestMetrics AS (
    SELECT
      m.id_nodo,
      tm.nombre_metrica,
      CAST(m.valor AS FLOAT) AS valor,
      m.timestamp_servidor,
      ROW_NUMBER() OVER (
        PARTITION BY m.id_nodo, tm.nombre_metrica
        ORDER BY m.timestamp_servidor DESC
      ) AS rn
    FROM Metricas m
    INNER JOIN TiposMetricas tm ON tm.id_tipo_metrica = m.id_tipo_metrica
  )
`;

async function getLatestMetrics(req, res, next) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
      ${latestMetricsCte}
      SELECT
        lm.id_nodo,
        MAX(CASE WHEN lm.nombre_metrica = 'disk_total' THEN lm.valor END) AS disk_total,
        MAX(CASE WHEN lm.nombre_metrica = 'disk_used' THEN lm.valor END) AS disk_used,
        MAX(CASE WHEN lm.nombre_metrica = 'disk_free' THEN lm.valor END) AS disk_free,
        MAX(CASE WHEN lm.nombre_metrica = 'ram_total' THEN lm.valor END) AS ram_total,
        MAX(CASE WHEN lm.nombre_metrica = 'ram_used' THEN lm.valor END) AS ram_used,
        MAX(CASE WHEN lm.nombre_metrica = 'cpu_usage' THEN lm.valor END) AS cpu_usage,
        MAX(lm.timestamp_servidor) AS latest_timestamp
      FROM LatestMetrics lm
      WHERE lm.rn = 1
      GROUP BY lm.id_nodo
      ORDER BY lm.id_nodo
    `);

        res.json(result.recordset);
    } catch (error) {
        next(error);
    }
}

async function getLatestMetricsByNode(req, res, next) {
    try {
        const nodeId = Number(req.params.id);

        if (Number.isNaN(nodeId)) {
            return res.status(400).json({ error: 'Invalid node id' });
        }

        const pool = await getConnection();
        const result = await pool.request().input('id_nodo', sql.Int, nodeId).query(`
      ${latestMetricsCte}
      SELECT
        lm.id_nodo,
        MAX(CASE WHEN lm.nombre_metrica = 'disk_total' THEN lm.valor END) AS disk_total,
        MAX(CASE WHEN lm.nombre_metrica = 'disk_used' THEN lm.valor END) AS disk_used,
        MAX(CASE WHEN lm.nombre_metrica = 'disk_free' THEN lm.valor END) AS disk_free,
        MAX(CASE WHEN lm.nombre_metrica = 'ram_total' THEN lm.valor END) AS ram_total,
        MAX(CASE WHEN lm.nombre_metrica = 'ram_used' THEN lm.valor END) AS ram_used,
        MAX(CASE WHEN lm.nombre_metrica = 'cpu_usage' THEN lm.valor END) AS cpu_usage,
        MAX(lm.timestamp_servidor) AS latest_timestamp
      FROM LatestMetrics lm
      WHERE lm.rn = 1
        AND lm.id_nodo = @id_nodo
      GROUP BY lm.id_nodo
    `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No metrics found for node' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        next(error);
    }
}

async function getMetricsHistoryByNode(req, res, next) {
    try {
        const nodeId = Number(req.params.id);

        if (Number.isNaN(nodeId)) {
            return res.status(400).json({ error: 'Invalid node id' });
        }

        const pool = await getConnection();
        const result = await pool.request().input('id_nodo', sql.Int, nodeId).query(`
      SELECT
        m.id_metrica,
        m.id_nodo,
        tm.nombre_metrica,
        m.valor,
        m.timestamp_servidor
      FROM Metricas m
      INNER JOIN TiposMetricas tm ON tm.id_tipo_metrica = m.id_tipo_metrica
      WHERE m.id_nodo = @id_nodo
      ORDER BY m.timestamp_servidor DESC
    `);

        res.json(result.recordset);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getLatestMetrics,
    getLatestMetricsByNode,
    getMetricsHistoryByNode
};