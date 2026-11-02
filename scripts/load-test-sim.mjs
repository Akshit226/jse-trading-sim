/**
 * Concurrency & Load Stress Test for JSE Trading Simulator
 * Simulates 30-40 concurrent students joining and executing trades simultaneously.
 *
 * Usage:
 *   node scripts/load-test-sim.mjs [url] [numStudents] [tradesPerStudent]
 * Example:
 *   node scripts/load-test-sim.mjs http://localhost:3000 35 4
 */

const targetUrl = process.argv[2] || "http://localhost:3000";
const numStudents = parseInt(process.argv[3] || "35", 10);
const tradesPerStudent = parseInt(process.argv[4] || "4", 10);
const roomCode = "WALLST";

const ASSETS = ["COFORGE", "MPHASIS", "TATAELXSI", "LTTS", "OFSS", "COLPAL", "PGHH", "RADICO", "UBL", "GILLETTE"];
const STUDENT_NAMES = [
  "Aarav Sharma", "Aditi Patel", "Rohan Verma", "Priya Nair", "Vikram Malhotra",
  "Ananya Iyer", "Kavya Reddy", "Arjun Mehta", "Sneha Rao", "Devansh Joshi",
  "Ishaan Gupta", "Meera Nambiar", "Tanvi Bhatia", "Karan Singhania", "Riya Sen",
  "Manish Kapoor", "Neha Chawla", "Rahul Deshmukh", "Pooja Hegde", "Siddharth Bose",
  "Simran Gill", "Akash Mittal", "Zoya Khan", "Kabir Bedi", "Shreya Das",
  "Nikhil Pillai", "Tara Kulkarni", "Dhruv Bansal", "Rhea Menon", "Samir Merchant",
  "Ayesha Sheikh", "Gaurav Aggarwal", "Bhavna Jain", "Yash Chopra", "Harshita Saxena",
  "Varun Dhawan", "Divya Pillai", "Pranav Roy", "Shruti Tiwari", "Abhishek Kumar"
];

async function postJSON(url, body) {
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t1 = performance.now();
  const latency = Math.round(t1 - t0);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, latency };
}

async function getJSON(url) {
  const t0 = performance.now();
  const res = await fetch(url);
  const t1 = performance.now();
  const latency = Math.round(t1 - t0);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, latency };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLoadTest() {
  console.log("==================================================================");
  console.log(`🚀 JSE Trading Simulator: Concurrency & Stress Load Test`);
  console.log(`🎯 Target Endpoint: ${targetUrl}`);
  console.log(`👥 Concurrent Students: ${numStudents}`);
  console.log(`📊 Trades per Student: ${tradesPerStudent} (Total Expected Trades: ${numStudents * tradesPerStudent})`);
  console.log("==================================================================\n");

  // Step 1: Healthcheck room
  console.log(`[Phase 1] Checking room ${roomCode} accessibility...`);
  const roomCheck = await getJSON(`${targetUrl}/api/room?code=${roomCode}`);
  if (roomCheck.status !== 200 || !roomCheck.data?.success) {
    console.error("❌ Failed to reach room endpoint. Status:", roomCheck.status);
    process.exit(1);
  }
  console.log(`✅ Room ${roomCode} is accessible! Current status: ${roomCheck.data.room?.status || "UNKNOWN"} (Latency: ${roomCheck.latency}ms)\n`);

  // Step 2: Concurrent Student Registration (JOIN burst)
  console.log(`[Phase 2] Simulating ${numStudents} students joining concurrently...`);
  const joinLatencies = [];
  let joinSuccessCount = 0;

  const joinPromises = Array.from({ length: numStudents }).map(async (_, idx) => {
    const studentId = `std_load_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`;
    const studentName = STUDENT_NAMES[idx % STUDENT_NAMES.length];
    const studentEmail = `${studentName.toLowerCase().replace(/\s+/g, ".")}@jain.edu.in`;

    const payload = {
      action: "JOIN",
      code: roomCode,
      data: {
        player: {
          id: studentId,
          name: studentName,
          email: studentEmail,
          desk: "tech_analyst",
          cash: 615750,
          shares: {
            MPHASIS: 25,
            COFORGE: 10,
            OFSS: 5,
            LTTS: 15,
            TATAELXSI: 15,
            COLPAL: 0,
            PGHH: 0,
            RADICO: 0,
            UBL: 0,
            GILLETTE: 0,
          },
          initialNetWorth: 1000000,
          totalNetWorth: 1000000,
          returnPercent: 0,
          rank: idx + 1,
        },
      },
    };

    const res = await postJSON(`${targetUrl}/api/room`, payload);
    joinLatencies.push(res.latency);
    if (res.status === 200 && res.data?.success) {
      joinSuccessCount++;
    }
    return { id: studentId, name: studentName, res };
  });

  const students = await Promise.all(joinPromises);
  const avgJoinLatency = Math.round(joinLatencies.reduce((a, b) => a + b, 0) / joinLatencies.length);
  const maxJoinLatency = Math.max(...joinLatencies);
  console.log(`✅ ${joinSuccessCount}/${numStudents} students joined successfully!`);
  console.log(`   ⏱️  Avg Join Latency: ${avgJoinLatency}ms | Max: ${maxJoinLatency}ms\n`);

  // Step 3: Concurrent Trade Execution Burst
  console.log(`[Phase 3] Simulating concurrent order bursts (${numStudents * tradesPerStudent} total orders)...`);
  const orderLatencies = [];
  let orderSuccessCount = 0;
  let orderFailCount = 0;

  const tradeTasks = [];
  for (let t = 0; t < tradesPerStudent; t++) {
    for (let s = 0; s < numStudents; s++) {
      const student = students[s];
      // Alternate between BUY (using ₹10L cash) and valid SELL (or BUY across various equities)
      const assetId = ASSETS[(s + t) % ASSETS.length];
      const side = t === 3 ? "SELL" : "BUY";
      const finalAsset = side === "SELL" ? "MPHASIS" : assetId;
      const quantity = side === "SELL" ? 1 : Math.floor(Math.random() * 3) + 1;

      tradeTasks.push(async () => {
        // Small random stagger (0 to 300ms) to simulate real human clicking within the same second
        await sleep(Math.floor(Math.random() * 300));

        const order = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          playerId: student.id,
          playerName: student.name,
          desk: "tech_analyst",
          assetId: finalAsset,
          side: side,
          quantity,
          price: 5000,
          total: quantity * 5000,
          timestamp: Date.now(),
        };

        const res = await postJSON(`${targetUrl}/api/room`, {
          action: "ORDER",
          code: roomCode,
          data: order,
        });

        orderLatencies.push(res.latency);
        if (res.status === 200 && res.data?.success) {
          orderSuccessCount++;
        } else {
          orderFailCount++;
          if (orderFailCount <= 3) {
            console.log("Sample failure:", res.data?.error || res.data || res.status);
          }
        }
      });
    }
  }

  const startTime = performance.now();
  // Run all trade requests concurrently
  await Promise.all(tradeTasks.map((fn) => fn()));
  const totalDurationSec = ((performance.now() - startTime) / 1000).toFixed(2);

  // Step 4: Statistical Metrics Analysis
  orderLatencies.sort((a, b) => a - b);
  const totalOrders = orderLatencies.length;
  const avgOrderLatency = Math.round(orderLatencies.reduce((a, b) => a + b, 0) / totalOrders);
  const p50 = orderLatencies[Math.floor(totalOrders * 0.5)];
  const p90 = orderLatencies[Math.floor(totalOrders * 0.9)];
  const p95 = orderLatencies[Math.floor(totalOrders * 0.95)];
  const maxOrderLatency = orderLatencies[totalOrders - 1];
  const throughput = (totalOrders / parseFloat(totalDurationSec)).toFixed(1);

  // Step 5: Final Room Consistency Check
  const finalRoomCheck = await getJSON(`${targetUrl}/api/room?code=${roomCode}`);
  const finalRoom = finalRoomCheck.data?.room;
  const finalPlayerCount = Object.keys(finalRoom?.players || {}).length;

  console.log("\n==================================================================");
  console.log(`📊 PERFORMANCE & STRESS TEST RESULTS`);
  console.log("==================================================================");
  console.log(`👥 Connected Students      : ${numStudents}`);
  console.log(`📦 Total Orders Dispatched : ${totalOrders}`);
  console.log(`✅ Successful Orders       : ${orderSuccessCount} (${((orderSuccessCount / totalOrders) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed Orders           : ${orderFailCount}`);
  console.log(`⚡ Throughput              : ${throughput} orders/second`);
  console.log(`⏱️  Total Test Duration     : ${totalDurationSec}s`);
  console.log(`------------------------------------------------------------------`);
  console.log(`📈 Latency Breakdown:`);
  console.log(`   - P50 (Median)          : ${p50}ms`);
  console.log(`   - P90                   : ${p90}ms`);
  console.log(`   - P95                   : ${p95}ms`);
  console.log(`   - Average Latency       : ${avgOrderLatency}ms`);
  console.log(`   - Maximum Latency       : ${maxOrderLatency}ms`);
  console.log(`------------------------------------------------------------------`);
  console.log(`🔎 State Verification:`);
  console.log(`   - Players in Room Store : ${finalPlayerCount}`);
  console.log(`   - System Health         : ${orderFailCount === 0 ? "🟢 100% HEALTHY - READY FOR 30-40 STUDENTS" : "⚠️ DEGRADED"}`);
  console.log("==================================================================\n");
}

runLoadTest().catch(console.error);
