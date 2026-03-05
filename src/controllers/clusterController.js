const { getConnection } = require('../db');

async function getClusterSummary(req, res, next) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
      WITH LatestMetrics AS (
        SELECT
          m.id_nodo,
          tm.nombre_metrica,
          CAST(m.valor AS FLOAT) AS valor,
          ROW_NUMBER() OVER (
            PARTITION BY m.id_nodo, tm.nombre_metrica
            ORDER BY m.timestamp_servidor DESC
          ) AS rn
        FROM Metricas m
        INNER JOIN TiposMetricas tm ON tm.id_tipo_metrica = m.id_tipo_metrica
      ),
      NodeMetrics AS (
        SELECT
          lm.id_nodo,
          MAX(CASE WHEN lm.nombre_metrica = 'disk_total' THEN lm.valor END) AS disk_total,
          MAX(CASE WHEN lm.nombre_metrica = 'disk_used' THEN lm.valor END) AS disk_used,
          MAX(CASE WHEN lm.nombre_metrica = 'disk_free' THEN lm.valor END) AS disk_free
        FROM LatestMetrics lm
        WHERE lm.rn = 1
        GROUP BY lm.id_nodo
      )
      SELECT
        COALESCE(SUM(nm.disk_total), 0) AS total_disk_capacity,
        COALESCE(SUM(nm.disk_used), 0) AS total_used,
        COALESCE(SUM(nm.disk_free), 0) AS total_free,
        CASE
          WHEN COALESCE(SUM(nm.disk_total), 0) = 0 THEN 0
          ELSE (COALESCE(SUM(nm.disk_used), 0) * 100.0) / COALESCE(SUM(nm.disk_total), 0)
        END AS utilization_percentage,
        SUM(CASE WHEN LOWER(n.estado) = 'activo' THEN 1 ELSE 0 END) AS active_nodes,
        COUNT(*) AS total_nodes
      FROM Nodos n
      LEFT JOIN NodeMetrics nm ON nm.id_nodo = n.id_nodo
    `);

        res.json(result.recordset[0]);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getClusterSummary
};