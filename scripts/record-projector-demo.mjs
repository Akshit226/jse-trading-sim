import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("D:/Akshit/OmniRoute-release-v3.8.50/node_modules/playwright");
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const TARGET_URL = "https://jse-trading-sim.vercel.app/projector/WALLST";
const API_URL = "https://jse-trading-sim.vercel.app/api/room";
const OUTPUT_DIR = path.resolve("./video-recordings");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function triggerNews() {
  try {
    const payload = {
      action: "NEWS",
      code: "WALLST",
      data: {
        id: `news_${Date.now()}`,
        round: 1,
        title: "Tata Elxsi Secures €1.2B AI Mobility & Autonomous Driving Contract",
        description:
          "Automotive Engineering Milestone: Tata Elxsi expands high-margin order pipeline across Europe. Institutional investors initiate aggressive block-deal accumulations across the IT basket.",
        affectedAsset: "TATAELXSI",
        sentiment: "strongly_bullish",
        priceImpact: 0.18,
        soundCue: "bullish_alert",
        deskWhisper: {
          desk: "tech_analyst",
          rumorText:
            "Munich auto corridor channel checks confirm a 5-year Tier-1 autonomous software contract.",
        },
        timestamp: Date.now(),
      },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[Trigger] News event dispatched:", res.status);
  } catch (err) {
    console.warn("[Trigger] Failed to dispatch news API:", err.message);
  }
}

async function run() {
  console.log("Launching Microsoft Edge with Playwright...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });

  console.log("Recording Projector HUD initial state...");
  await page.waitForTimeout(3000);

  // Click on different stocks in the top ticker strip
  console.log("Interacting with ticker strip (selecting stocks)...");
  try {
    const stockButtons = page.locator("button:has-text('TATAELXSI'), button:has-text('COFORGE'), button:has-text('RADICO')");
    const count = await stockButtons.count();
    for (let i = 0; i < count; i++) {
      await stockButtons.nth(i).click();
      await page.waitForTimeout(1500);
    }
  } catch (e) {
    console.warn("Ticker click warning:", e.message);
  }

  // Trigger Breaking News live
  console.log("Triggering live Breaking News catalyst...");
  await triggerNews();
  await page.waitForTimeout(4000);

  // Toggle between Chart and News HUD
  console.log("Demonstrating HUD Switcher (Chart vs News Wire)...");
  try {
    const chartBtn = page.locator("button:has-text('Chart')");
    if (await chartBtn.isVisible()) {
      await chartBtn.click();
      await page.waitForTimeout(3000);
    }

    const newsBtn = page.locator("button:has-text('Breaking News HUD')");
    if (await newsBtn.isVisible()) {
      await newsBtn.click();
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.warn("View toggle warning:", e.message);
  }

  // Final hold
  await page.waitForTimeout(2000);

  console.log("Closing page and saving video stream...");
  await page.close();
  await context.close();
  await browser.close();

  // Find the recorded webm file
  const videoFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".webm"));
  if (videoFiles.length === 0) {
    throw new Error("No video file generated in output directory");
  }

  // Sort by modification time to get the latest
  const latestWebm = videoFiles
    .map((f) => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time)[0].name;

  const rawPath = path.join(OUTPUT_DIR, latestWebm);
  const finalMp4 = path.join(OUTPUT_DIR, "jse-projector-hud-demo.mp4");
  const finalWebm = path.join(OUTPUT_DIR, "jse-projector-hud-demo.webm");

  fs.copyFileSync(rawPath, finalWebm);
  console.log(`Saved WebM video: ${finalWebm}`);

  console.log("Transcoding to MP4 via ffmpeg...");
  try {
    execSync(`ffmpeg -y -i "${rawPath}" -c:v libx264 -pix_fmt yuv420p -r 30 -preset fast "${finalMp4}"`, {
      stdio: "inherit",
    });
    console.log(`Transcoded MP4 video: ${finalMp4}`);
  } catch (err) {
    console.warn("FFmpeg transcode warning:", err.message);
  }

  // Also copy to public directory of classroom-trading-sim
  const publicDir = path.resolve("./public");
  if (fs.existsSync(finalMp4)) {
    fs.copyFileSync(finalMp4, path.join(publicDir, "jse-projector-hud-demo.mp4"));
    console.log("Copied demo MP4 to public/jse-projector-hud-demo.mp4");
  }
  if (fs.existsSync(finalWebm)) {
    fs.copyFileSync(finalWebm, path.join(publicDir, "jse-projector-hud-demo.webm"));
    console.log("Copied demo WebM to public/jse-projector-hud-demo.webm");
  }

  console.log("Video generation finished successfully!");
}

run().catch((err) => {
  console.error("Video generation failed:", err);
  process.exit(1);
});
