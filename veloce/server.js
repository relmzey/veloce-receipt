const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

function readLastOrderId() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const lastOrderId = Number(parsed.lastOrderId);

    if (!Number.isFinite(lastOrderId) || lastOrderId < 0) {
      return 0;
    }

    return Math.floor(lastOrderId);
  } catch (error) {
    return 0;
  }
}

function writeLastOrderId(lastOrderId) {
  const payload = { lastOrderId };
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', (req, res) => {
  try {
    const currentOrderId = readLastOrderId();
    const nextOrderId = currentOrderId + 1;

    writeLastOrderId(nextOrderId);

    res.json({
      orderId: nextOrderId,
      date: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Veloce Receipt Maker running on http://0.0.0.0:${PORT}`);
});
