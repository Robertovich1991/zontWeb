/**
 * Teltonika FMB/FMC TCP Gateway — Codec8 & Codec8E Decoder
 * 
 * Receives raw TCP connections from Teltonika GPS trackers,
 * decodes IMEI handshake + AVL data, and forwards JSON to the webhook.
 * 
 * Protocol flow:
 *   1. Device connects via TCP
 *   2. Device sends IMEI (2-byte length + ASCII IMEI)
 *   3. Server responds 0x01 (accept)
 *   4. Device sends AVL packet (Codec8 or Codec8E)
 *   5. Server responds with 4-byte record count ACK
 *   6. Repeat from step 4...
 * 
 * Usage:  node teltonika-decoder.js
 * Config: Copy .env.example to .env and fill in your values
 */

'use strict';

const net = require('net');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Load .env file ───────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('[FATAL] .env file not found. Copy .env.example to .env and configure it.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ── Configuration ────────────────────────────────────────────────────
const CONFIG = {
  TCP_PORT: parseInt(process.env.TCP_PORT || '5055'),
  WEBHOOK_URL: process.env.WEBHOOK_URL || '',
  GPS_API_KEY: process.env.GPS_API_KEY || '',
  VERBOSE: (process.env.VERBOSE || 'true').toLowerCase() === 'true',
  BATCH_INTERVAL_MS: parseInt(process.env.BATCH_INTERVAL_MS || '10000'),
  MAX_CONNECTIONS: parseInt(process.env.MAX_CONNECTIONS || '100'),
};

if (!CONFIG.WEBHOOK_URL) {
  console.error('[FATAL] WEBHOOK_URL not set in .env');
  process.exit(1);
}
if (!CONFIG.GPS_API_KEY) {
  console.error('[FATAL] GPS_API_KEY not set in .env');
  process.exit(1);
}

// ── Logging ──────────────────────────────────────────────────────────
function log(level, msg, data) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, typeof data === 'object' ? JSON.stringify(data) : data);
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

function verbose(msg, data) {
  if (CONFIG.VERBOSE) log('DEBUG', msg, data);
}

// ── CRC-16/IBM (ARC) ────────────────────────────────────────────────
function crc16IBM(buffer) {
  let crc = 0x0000;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc & 0xFFFF;
}

// ── Known Teltonika IO Element IDs ──────────────────────────────────
const IO_NAMES = {
  1: 'din1',           // Digital Input 1
  2: 'din2',           // Digital Input 2
  3: 'din3',           // Digital Input 3
  9: 'analogInput1',   // Analog Input 1
  11: 'iccid1',        // SIM ICCID
  16: 'totalOdometer', // Total Odometer (m)
  21: 'gsmSignal',     // GSM Signal (1-5)
  24: 'gsmSpeed',      // Speed by GSM
  66: 'extVoltage',    // External Voltage (mV)
  67: 'battVoltage',   // Battery Voltage (mV)
  68: 'battCurrent',   // Battery Current (mA)
  69: 'gnssStatus',    // GNSS Status
  80: 'dataMode',      // Data Mode (0=Home, 1=Roaming, 2=Unknown)
  113: 'battLevel',    // Battery Level (%)
  181: 'gnssPdop',     // GNSS PDOP
  182: 'gnssHdop',     // GNSS HDOP
  199: 'tripOdometer', // Trip Odometer (m)
  200: 'sleepMode',    // Sleep Mode
  205: 'gsmCellId',    // GSM Cell ID
  206: 'gsmAreaCode',  // GSM Area Code
  239: 'ignition',     // Ignition (0=Off, 1=On)
  240: 'movement',     // Movement (0=Stop, 1=Moving)
  241: 'gsmOperator',  // GSM Operator Code
  253: 'alarmGreen',   // Green Driving alarm
  254: 'alarmUnsafe',  // Unsafe Driving alarm
  303: 'imsi',
  380: 'ble1Temp',     // BLE Temperature Sensor 1
};

// ── Codec8 AVL Decoder ──────────────────────────────────────────────

function parseIMEI(buffer) {
  // First 2 bytes = length of IMEI string, rest = IMEI in ASCII
  if (buffer.length < 2) return null;
  const len = buffer.readUInt16BE(0);
  if (buffer.length < 2 + len) return null;
  const imei = buffer.slice(2, 2 + len).toString('ascii');
  // Validate: IMEI should be 15 digits
  if (!/^\d{15}$/.test(imei)) return null;
  return imei;
}

function parseIOElements(buf, offset, codecId) {
  const io = {};
  const extended = (codecId === 0x8E);

  // Event IO ID
  let eventIoId;
  if (extended) {
    eventIoId = buf.readUInt16BE(offset); offset += 2;
  } else {
    eventIoId = buf.readUInt8(offset); offset += 1;
  }
  io._eventIoId = eventIoId;

  // Total IO count
  let totalIo;
  if (extended) {
    totalIo = buf.readUInt16BE(offset); offset += 2;
  } else {
    totalIo = buf.readUInt8(offset); offset += 1;
  }

  // Parse N1 (1-byte values)
  let n1Count;
  if (extended) {
    n1Count = buf.readUInt16BE(offset); offset += 2;
  } else {
    n1Count = buf.readUInt8(offset); offset += 1;
  }
  for (let i = 0; i < n1Count; i++) {
    let id;
    if (extended) {
      id = buf.readUInt16BE(offset); offset += 2;
    } else {
      id = buf.readUInt8(offset); offset += 1;
    }
    const val = buf.readUInt8(offset); offset += 1;
    const name = IO_NAMES[id] || `io_${id}`;
    io[name] = val;
  }

  // Parse N2 (2-byte values)
  let n2Count;
  if (extended) {
    n2Count = buf.readUInt16BE(offset); offset += 2;
  } else {
    n2Count = buf.readUInt8(offset); offset += 1;
  }
  for (let i = 0; i < n2Count; i++) {
    let id;
    if (extended) {
      id = buf.readUInt16BE(offset); offset += 2;
    } else {
      id = buf.readUInt8(offset); offset += 1;
    }
    const val = buf.readUInt16BE(offset); offset += 2;
    const name = IO_NAMES[id] || `io_${id}`;
    io[name] = val;
  }

  // Parse N4 (4-byte values)
  let n4Count;
  if (extended) {
    n4Count = buf.readUInt16BE(offset); offset += 2;
  } else {
    n4Count = buf.readUInt8(offset); offset += 1;
  }
  for (let i = 0; i < n4Count; i++) {
    let id;
    if (extended) {
      id = buf.readUInt16BE(offset); offset += 2;
    } else {
      id = buf.readUInt8(offset); offset += 1;
    }
    const val = buf.readUInt32BE(offset); offset += 4;
    const name = IO_NAMES[id] || `io_${id}`;
    io[name] = val;
  }

  // Parse N8 (8-byte values)
  let n8Count;
  if (extended) {
    n8Count = buf.readUInt16BE(offset); offset += 2;
  } else {
    n8Count = buf.readUInt8(offset); offset += 1;
  }
  for (let i = 0; i < n8Count; i++) {
    let id;
    if (extended) {
      id = buf.readUInt16BE(offset); offset += 2;
    } else {
      id = buf.readUInt8(offset); offset += 1;
    }
    const val = buf.readBigUInt64BE(offset); offset += 8;
    const name = IO_NAMES[id] || `io_${id}`;
    io[name] = Number(val);
  }

  // Codec8E: Parse NX (variable length values)
  if (extended) {
    let nxCount = buf.readUInt16BE(offset); offset += 2;
    for (let i = 0; i < nxCount; i++) {
      const id = buf.readUInt16BE(offset); offset += 2;
      const len = buf.readUInt16BE(offset); offset += 2;
      const val = buf.slice(offset, offset + len); offset += len;
      const name = IO_NAMES[id] || `io_${id}`;
      io[name] = val.toString('hex');
    }
  }

  return { io, newOffset: offset };
}

function parseAVLPacket(buffer) {
  if (buffer.length < 12) {
    return { error: 'Packet too short', records: [], bytesConsumed: 0 };
  }

  // Preamble: 4 zero bytes
  const preamble = buffer.readUInt32BE(0);
  if (preamble !== 0x00000000) {
    return { error: `Invalid preamble: 0x${preamble.toString(16)}`, records: [], bytesConsumed: 0 };
  }

  // Data field length
  const dataLen = buffer.readUInt32BE(4);
  const totalPacketLen = 8 + dataLen + 4; // preamble(4) + length(4) + data + crc(4)

  if (buffer.length < totalPacketLen) {
    return { error: 'Incomplete packet', records: [], bytesConsumed: 0 };
  }

  // CRC check (covers the data portion: from byte 8 to 8+dataLen)
  const dataSection = buffer.slice(8, 8 + dataLen);
  const receivedCRC = buffer.readUInt32BE(8 + dataLen);
  const calculatedCRC = crc16IBM(dataSection);

  if (receivedCRC !== calculatedCRC) {
    log('WARN', `CRC mismatch: received=0x${receivedCRC.toString(16)}, calculated=0x${calculatedCRC.toString(16)}`);
    // Continue anyway for robustness - some devices have quirks
  }

  // Codec ID
  const codecId = buffer.readUInt8(8);
  if (codecId !== 0x08 && codecId !== 0x8E) {
    return { error: `Unsupported codec: 0x${codecId.toString(16)}`, records: [], bytesConsumed: totalPacketLen };
  }

  const codecName = codecId === 0x08 ? 'Codec8' : 'Codec8E';

  // Number of records
  const numRecords1 = buffer.readUInt8(9);

  // Parse each AVL record
  let offset = 10; // Start after codec ID + record count
  const records = [];

  for (let i = 0; i < numRecords1; i++) {
    try {
      // Timestamp: 8 bytes (milliseconds since Unix epoch)
      const timestampMs = buffer.readBigUInt64BE(offset); offset += 8;
      const timestamp = new Date(Number(timestampMs));

      // Priority: 1 byte
      const priority = buffer.readUInt8(offset); offset += 1;

      // GPS Element
      const longitude = buffer.readInt32BE(offset) / 10000000; offset += 4;
      const latitude = buffer.readInt32BE(offset) / 10000000; offset += 4;
      const altitude = buffer.readUInt16BE(offset); offset += 2;
      const angle = buffer.readUInt16BE(offset); offset += 2;
      const satellites = buffer.readUInt8(offset); offset += 1;
      const speed = buffer.readUInt16BE(offset); offset += 2;

      // IO Elements
      const { io, newOffset } = parseIOElements(buffer, offset, codecId);
      offset = newOffset;

      records.push({
        timestamp: timestamp.toISOString(),
        lat: latitude,
        lng: longitude,
        speed: speed,
        heading: angle,
        altitude: altitude,
        satellites: satellites,
        ignition: io.ignition !== undefined ? (io.ignition === 1) : null,
        priority: priority,
        io: io,
      });
    } catch (err) {
      log('ERROR', `Failed to parse record ${i + 1}/${numRecords1}: ${err.message}`);
      break;
    }
  }

  // Number of records 2 (should match numRecords1)
  const numRecords2 = buffer.readUInt8(8 + dataLen - 1);
  if (numRecords1 !== numRecords2) {
    log('WARN', `Record count mismatch: start=${numRecords1}, end=${numRecords2}`);
  }

  return {
    codec: codecName,
    records,
    recordCount: numRecords1,
    bytesConsumed: totalPacketLen,
    error: null,
  };
}

// ── Webhook sender ───────────────────────────────────────────────────

const pendingBatch = new Map(); // imei -> positions[]

function queuePositions(imei, positions) {
  if (!pendingBatch.has(imei)) {
    pendingBatch.set(imei, []);
  }
  pendingBatch.get(imei).push(...positions);
}

async function sendWebhook(imei, positions) {
  const payload = JSON.stringify({ imei, positions });
  const url = new URL(CONFIG.WEBHOOK_URL);
  const isHttps = url.protocol === 'https:';
  const lib = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GPS-API-Key': CONFIG.GPS_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 10000,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          verbose(`Webhook OK for IMEI ${imei}: ${body}`);
          resolve(JSON.parse(body));
        } else {
          log('ERROR', `Webhook failed for IMEI ${imei}: HTTP ${res.statusCode} - ${body}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      log('ERROR', `Webhook network error for IMEI ${imei}: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      log('ERROR', `Webhook timeout for IMEI ${imei}`);
      reject(new Error('Timeout'));
    });

    req.write(payload);
    req.end();
  });
}

// Batch flush: send accumulated positions periodically
setInterval(async () => {
  if (pendingBatch.size === 0) return;

  const entries = Array.from(pendingBatch.entries());
  pendingBatch.clear();

  for (const [imei, positions] of entries) {
    if (positions.length === 0) continue;
    try {
      await sendWebhook(imei, positions);
      log('INFO', `Sent ${positions.length} positions for IMEI ${imei}`);
    } catch (err) {
      log('ERROR', `Failed to send ${positions.length} positions for IMEI ${imei}: ${err.message}`);
      // Re-queue failed positions
      queuePositions(imei, positions);
    }
  }
}, CONFIG.BATCH_INTERVAL_MS);

// ── TCP Server ───────────────────────────────────────────────────────

let activeConnections = 0;

const server = net.createServer((socket) => {
  activeConnections++;
  const remoteAddr = `${socket.remoteAddress}:${socket.remotePort}`;
  let deviceIMEI = null;
  let dataBuffer = Buffer.alloc(0);

  if (activeConnections > CONFIG.MAX_CONNECTIONS) {
    log('WARN', `Max connections reached (${CONFIG.MAX_CONNECTIONS}), rejecting ${remoteAddr}`);
    socket.destroy();
    activeConnections--;
    return;
  }

  log('INFO', `New connection from ${remoteAddr} (active: ${activeConnections})`);

  socket.on('data', (data) => {
    // Accumulate data in buffer (TCP can split/merge packets)
    dataBuffer = Buffer.concat([dataBuffer, data]);

    verbose(`Received ${data.length} bytes from ${remoteAddr}`, `[${data.toString('hex').slice(0, 100)}...]`);

    // ── Stage 1: IMEI Handshake ──
    if (!deviceIMEI) {
      const imei = parseIMEI(dataBuffer);
      if (imei) {
        deviceIMEI = imei;
        dataBuffer = Buffer.alloc(0); // Clear buffer after IMEI
        log('INFO', `Device authenticated: IMEI=${imei} from ${remoteAddr}`);

        // Send acceptance byte
        socket.write(Buffer.from([0x01]));
        verbose(`Sent IMEI accept (0x01) to ${imei}`);
      } else {
        // Might be incomplete - wait for more data
        if (dataBuffer.length > 100) {
          log('WARN', `Invalid IMEI data from ${remoteAddr}, closing`);
          socket.destroy();
        }
      }
      return;
    }

    // ── Stage 2: AVL Data Packets ──
    while (dataBuffer.length >= 12) {
      const result = parseAVLPacket(dataBuffer);

      if (result.error === 'Incomplete packet') {
        // Wait for more data
        verbose(`Waiting for more data (have ${dataBuffer.length} bytes) for IMEI ${deviceIMEI}`);
        break;
      }

      if (result.error && result.bytesConsumed === 0) {
        log('ERROR', `Parse error for IMEI ${deviceIMEI}: ${result.error}`);
        dataBuffer = Buffer.alloc(0);
        break;
      }

      // Consume processed bytes
      dataBuffer = dataBuffer.slice(result.bytesConsumed);

      if (result.records.length > 0) {
        log('INFO', `IMEI=${deviceIMEI}: Decoded ${result.records.length} records (${result.codec})`);

        if (CONFIG.VERBOSE) {
          for (const rec of result.records) {
            log('DEBUG', `  -> ${rec.timestamp} | lat=${rec.lat.toFixed(6)} lng=${rec.lng.toFixed(6)} | speed=${rec.speed}km/h heading=${rec.heading}° | sat=${rec.satellites} | ign=${rec.ignition}`);
          }
        }

        // Strip internal IO data before sending to webhook
        const positions = result.records.map(r => ({
          timestamp: r.timestamp,
          lat: r.lat,
          lng: r.lng,
          speed: r.speed,
          heading: r.heading,
          altitude: r.altitude,
          satellites: r.satellites,
          ignition: r.ignition,
        }));

        queuePositions(deviceIMEI, positions);
      }

      // ACK: respond with number of records accepted (4 bytes big-endian)
      const ack = Buffer.alloc(4);
      ack.writeUInt32BE(result.recordCount);
      socket.write(ack);
      verbose(`Sent ACK (${result.recordCount} records) to IMEI ${deviceIMEI}`);
    }
  });

  socket.on('close', () => {
    activeConnections--;
    log('INFO', `Connection closed: IMEI=${deviceIMEI || 'unknown'} from ${remoteAddr} (active: ${activeConnections})`);
  });

  socket.on('error', (err) => {
    if (err.code !== 'ECONNRESET') {
      log('ERROR', `Socket error for IMEI ${deviceIMEI || 'unknown'}: ${err.message}`);
    }
  });

  // Timeout idle connections (5 minutes)
  socket.setTimeout(300000, () => {
    log('WARN', `Idle timeout for IMEI ${deviceIMEI || 'unknown'} from ${remoteAddr}`);
    socket.destroy();
  });
});

server.on('error', (err) => {
  log('FATAL', `Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    log('FATAL', `Port ${CONFIG.TCP_PORT} is already in use. Kill the existing process or change TCP_PORT.`);
  }
  process.exit(1);
});

server.listen(CONFIG.TCP_PORT, '0.0.0.0', () => {
  log('INFO', '═══════════════════════════════════════════════════');
  log('INFO', '  Teltonika TCP Gateway started');
  log('INFO', `  Port:        ${CONFIG.TCP_PORT}`);
  log('INFO', `  Webhook:     ${CONFIG.WEBHOOK_URL}`);
  log('INFO', `  Verbose:     ${CONFIG.VERBOSE}`);
  log('INFO', `  Batch:       every ${CONFIG.BATCH_INTERVAL_MS}ms`);
  log('INFO', `  Max conns:   ${CONFIG.MAX_CONNECTIONS}`);
  log('INFO', '═══════════════════════════════════════════════════');
});

// ── Graceful shutdown ────────────────────────────────────────────────
function shutdown(signal) {
  log('INFO', `Received ${signal}, shutting down...`);
  server.close(() => {
    log('INFO', 'TCP server closed');
    // Flush remaining batch
    const entries = Array.from(pendingBatch.entries());
    if (entries.length > 0) {
      log('INFO', `Flushing ${entries.length} pending batches...`);
      Promise.all(entries.map(([imei, pos]) => sendWebhook(imei, pos).catch(() => {})))
        .then(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
