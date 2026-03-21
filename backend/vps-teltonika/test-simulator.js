/**
 * Teltonika FMB920 Simulator — Test the TCP decoder without a real device
 * 
 * Simulates:
 *   1. IMEI handshake
 *   2. Codec8 AVL packet with 2 GPS records
 *   3. Codec8E AVL packet with 1 GPS record
 * 
 * Usage: node test-simulator.js [host] [port]
 *   Default: localhost:5055
 */

'use strict';

const net = require('net');

const HOST = process.argv[2] || '127.0.0.1';
const PORT = parseInt(process.argv[3] || '5055');
const TEST_IMEI = '350424063817592';

function buildIMEIPacket(imei) {
  const imeiBytes = Buffer.from(imei, 'ascii');
  const lenBuf = Buffer.alloc(2);
  lenBuf.writeUInt16BE(imeiBytes.length);
  return Buffer.concat([lenBuf, imeiBytes]);
}

// CRC-16/IBM
function crc16IBM(buffer) {
  let crc = 0x0000;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) crc = (crc >> 1) ^ 0xA001;
      else crc = crc >> 1;
    }
  }
  return crc & 0xFFFF;
}

function buildCodec8Packet() {
  // Build 2 AVL records with Codec8
  const records = [];
  
  // Record 1: Nice, France — moving at 45 km/h
  const rec1 = Buffer.alloc(100);
  let off = 0;
  // Timestamp (ms since epoch): 2026-02-15 14:30:00 UTC
  const ts1 = BigInt(new Date('2026-02-15T14:30:00Z').getTime());
  rec1.writeBigUInt64BE(ts1, off); off += 8;
  // Priority
  rec1.writeUInt8(1, off); off += 1;
  // Longitude: 5.3698° * 10^7 = 53698000
  rec1.writeInt32BE(53698000, off); off += 4;
  // Latitude: 43.2965° * 10^7 = 432965000
  rec1.writeInt32BE(432965000, off); off += 4;
  // Altitude: 12m
  rec1.writeUInt16BE(12, off); off += 2;
  // Angle: 180°
  rec1.writeUInt16BE(180, off); off += 2;
  // Satellites: 8
  rec1.writeUInt8(8, off); off += 1;
  // Speed: 45 km/h
  rec1.writeUInt16BE(45, off); off += 2;
  // IO Elements
  rec1.writeUInt8(239, off); off += 1; // Event IO ID (ignition)
  rec1.writeUInt8(3, off); off += 1;   // Total IO count
  // N1: 2 elements
  rec1.writeUInt8(2, off); off += 1;
  rec1.writeUInt8(239, off); off += 1; rec1.writeUInt8(1, off); off += 1; // ignition=1
  rec1.writeUInt8(240, off); off += 1; rec1.writeUInt8(1, off); off += 1; // movement=1
  // N2: 1 element
  rec1.writeUInt8(1, off); off += 1;
  rec1.writeUInt8(66, off); off += 1; rec1.writeUInt16BE(14200, off); off += 2; // extVoltage=14200mV
  // N4: 0
  rec1.writeUInt8(0, off); off += 1;
  // N8: 0
  rec1.writeUInt8(0, off); off += 1;
  records.push(rec1.slice(0, off));

  // Record 2: Nice, France — accelerating to 60 km/h
  const rec2 = Buffer.alloc(100);
  off = 0;
  const ts2 = BigInt(new Date('2026-02-15T14:30:10Z').getTime());
  rec2.writeBigUInt64BE(ts2, off); off += 8;
  rec2.writeUInt8(0, off); off += 1; // Priority: low
  rec2.writeInt32BE(53700000, off); off += 4;  // Longitude: 5.3700
  rec2.writeInt32BE(432970000, off); off += 4;  // Latitude: 43.2970
  rec2.writeUInt16BE(15, off); off += 2; // Altitude
  rec2.writeUInt16BE(185, off); off += 2; // Angle
  rec2.writeUInt8(9, off); off += 1; // Satellites
  rec2.writeUInt16BE(60, off); off += 2; // Speed
  // IO (minimal)
  rec2.writeUInt8(0, off); off += 1; // Event IO ID
  rec2.writeUInt8(1, off); off += 1; // Total IO count
  rec2.writeUInt8(1, off); off += 1; // N1: 1
  rec2.writeUInt8(239, off); off += 1; rec2.writeUInt8(1, off); off += 1; // ignition=1
  rec2.writeUInt8(0, off); off += 1; // N2: 0
  rec2.writeUInt8(0, off); off += 1; // N4: 0
  rec2.writeUInt8(0, off); off += 1; // N8: 0
  records.push(rec2.slice(0, off));

  // Assemble AVL packet
  const recordCount = records.length;
  const allRecords = Buffer.concat(records);
  
  // Data section: codecId(1) + count1(1) + records + count2(1)
  const dataSection = Buffer.alloc(1 + 1 + allRecords.length + 1);
  dataSection.writeUInt8(0x08, 0); // Codec8
  dataSection.writeUInt8(recordCount, 1);
  allRecords.copy(dataSection, 2);
  dataSection.writeUInt8(recordCount, 2 + allRecords.length);

  const crc = crc16IBM(dataSection);

  // Full packet: preamble(4) + dataLen(4) + data + crc(4)
  const packet = Buffer.alloc(4 + 4 + dataSection.length + 4);
  packet.writeUInt32BE(0x00000000, 0); // Preamble
  packet.writeUInt32BE(dataSection.length, 4); // Data length
  dataSection.copy(packet, 8);
  packet.writeUInt32BE(crc, 8 + dataSection.length);

  return packet;
}

function buildCodec8EPacket() {
  // Build 1 AVL record with Codec8E
  const rec = Buffer.alloc(150);
  let off = 0;
  
  const ts = BigInt(new Date('2026-02-15T14:31:00Z').getTime());
  rec.writeBigUInt64BE(ts, off); off += 8;
  rec.writeUInt8(2, off); off += 1; // Priority: high (alarm)
  rec.writeInt32BE(53710000, off); off += 4;  // Longitude: 5.3710
  rec.writeInt32BE(432980000, off); off += 4;  // Latitude: 43.2980
  rec.writeUInt16BE(18, off); off += 2; // Altitude
  rec.writeUInt16BE(190, off); off += 2; // Angle
  rec.writeUInt8(10, off); off += 1; // Satellites
  rec.writeUInt16BE(72, off); off += 2; // Speed
  
  // IO Elements (Codec8E: 2-byte IDs and counts)
  rec.writeUInt16BE(239, off); off += 2; // Event IO ID
  rec.writeUInt16BE(2, off); off += 2;   // Total IO count
  // N1: 2 elements
  rec.writeUInt16BE(2, off); off += 2;
  rec.writeUInt16BE(239, off); off += 2; rec.writeUInt8(1, off); off += 1; // ignition=1
  rec.writeUInt16BE(240, off); off += 2; rec.writeUInt8(1, off); off += 1; // movement=1
  // N2: 0
  rec.writeUInt16BE(0, off); off += 2;
  // N4: 0
  rec.writeUInt16BE(0, off); off += 2;
  // N8: 0
  rec.writeUInt16BE(0, off); off += 2;
  // NX: 0
  rec.writeUInt16BE(0, off); off += 2;

  const allRecords = rec.slice(0, off);
  
  const dataSection = Buffer.alloc(1 + 1 + allRecords.length + 1);
  dataSection.writeUInt8(0x8E, 0); // Codec8E
  dataSection.writeUInt8(1, 1);
  allRecords.copy(dataSection, 2);
  dataSection.writeUInt8(1, 2 + allRecords.length);

  const crc = crc16IBM(dataSection);

  const packet = Buffer.alloc(4 + 4 + dataSection.length + 4);
  packet.writeUInt32BE(0x00000000, 0);
  packet.writeUInt32BE(dataSection.length, 4);
  dataSection.copy(packet, 8);
  packet.writeUInt32BE(crc, 8 + dataSection.length);

  return packet;
}

// ── Run simulation ───────────────────────────────────────────────────

console.log(`\n🛰️  Teltonika FMB920 Simulator`);
console.log(`   Connecting to ${HOST}:${PORT}...`);
console.log(`   IMEI: ${TEST_IMEI}\n`);

const client = new net.Socket();
let step = 0;

client.connect(PORT, HOST, () => {
  console.log('✅ Connected to TCP server');
  
  // Step 1: Send IMEI
  console.log('\n📤 Step 1: Sending IMEI handshake...');
  const imeiPacket = buildIMEIPacket(TEST_IMEI);
  console.log(`   Raw: ${imeiPacket.toString('hex')}`);
  client.write(imeiPacket);
  step = 1;
});

client.on('data', (data) => {
  console.log(`📥 Received: ${data.toString('hex')} (${data.length} bytes)`);

  if (step === 1) {
    // Should receive 0x01 (accept)
    if (data.length === 1 && data[0] === 0x01) {
      console.log('✅ IMEI accepted!\n');
      
      // Step 2: Send Codec8 packet
      console.log('📤 Step 2: Sending Codec8 AVL packet (2 records)...');
      const codec8 = buildCodec8Packet();
      console.log(`   Packet size: ${codec8.length} bytes`);
      console.log(`   Raw: ${codec8.toString('hex').slice(0, 80)}...`);
      client.write(codec8);
      step = 2;
    } else {
      console.log('❌ IMEI rejected!');
      client.destroy();
    }
  } else if (step === 2) {
    // Should receive ACK with record count
    if (data.length === 4) {
      const ackCount = data.readUInt32BE(0);
      console.log(`✅ ACK received: ${ackCount} records accepted\n`);

      // Step 3: Send Codec8E packet
      console.log('📤 Step 3: Sending Codec8E AVL packet (1 record)...');
      const codec8e = buildCodec8EPacket();
      console.log(`   Packet size: ${codec8e.length} bytes`);
      console.log(`   Raw: ${codec8e.toString('hex').slice(0, 80)}...`);
      client.write(codec8e);
      step = 3;
    }
  } else if (step === 3) {
    if (data.length === 4) {
      const ackCount = data.readUInt32BE(0);
      console.log(`✅ ACK received: ${ackCount} record accepted\n`);
      console.log('══════════════════════════════════════════');
      console.log('  All tests passed! Closing connection.');
      console.log('  Check your webhook/backend for the data.');
      console.log('══════════════════════════════════════════\n');
      
      // Wait for batch flush before closing
      setTimeout(() => client.destroy(), 2000);
    }
  }
});

client.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});

client.on('error', (err) => {
  console.error(`❌ Connection error: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.error(`   Make sure the decoder is running: node teltonika-decoder.js`);
  }
  process.exit(1);
});
