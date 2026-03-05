const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const nodesRoutes = require('./routes/nodes');
const metricsRoutes = require('./routes/metrics');
const clusterRoutes = require('./routes/cluster');
const messagesRoutes = require('./routes/messages');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/nodes', nodesRoutes);
app.use('/metrics', metricsRoutes);
app.use('/cluster', clusterRoutes);
app.use('/messages', messagesRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`StorageCluster Monitor API running on port ${port}`);
});