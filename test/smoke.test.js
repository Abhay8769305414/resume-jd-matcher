/**
 * Quick smoke test — creates a valid PDF using pdf-lib
 * and POSTs it to /api/match to verify the complete pipeline.
 *
 * Run: node test/smoke.test.js  (server must be running)
 */

const http = require("http");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function createPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const entries = [
    "John Doe - Senior Backend Developer",
    "",
    "Salary expectation: 12 LPA",
    "Experience: 4.5 years of experience",
    "",
    "Skills: Java, Spring Boot, React, Docker, Kubernetes, REST API, Kafka, MySQL, AWS, Git, Linux, Microservices"
  ];

  let y = height - 50;
  for (const text of entries) {
    page.drawText(text, {
      x: 50,
      y,
      size: text.includes("John Doe") ? 20 : 12,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 25;
  }

  return await pdfDoc.save();
}

async function runTest() {
  try {
    const pdfBuffer = await createPDF();
    
    const boundary = "----TestBoundary" + Date.now();
    const CRLF = "\r\n";

    const parts = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="resume"; filename="test_resume.pdf"`,
      `Content-Type: application/pdf`,
      "",
      ""  // body follows after join
    ].join(CRLF);

    const tail = `${CRLF}--${boundary}--${CRLF}`;
    const payload = Buffer.concat([Buffer.from(parts), Buffer.from(pdfBuffer), Buffer.from(tail)]);

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/match",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": payload.length
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        console.log(`\nStatus: ${res.statusCode}`);
        try {
          const json = JSON.parse(body);
          console.log(JSON.stringify(json, null, 2));

          // Basic assertions
          console.log("\n=== Smoke Test Results ===");
          console.log(`salary        : ${json.salary ? "✅ " + json.salary : "⚠️  null"}`);
          console.log(`experience    : ${json.yearOfExperience > 0 ? "✅ " + json.yearOfExperience + " years" : "⚠️  0"}`);
          console.log(`resumeSkills  : ${json.resumeSkills?.length > 0 ? "✅ " + json.resumeSkills.length + " skills" : "⚠️  none"}`);
          console.log(`matchingJobs  : ${json.matchingJobs?.length > 0 ? "✅ " + json.matchingJobs.length + " jobs" : "❌ none"}`);

          if (json.matchingJobs?.length > 0) {
            const top = json.matchingJobs[0];
            console.log(`  top match   : ${top.role} (${top.matchingScore}%)`);
          }
          console.log("=========================\n");
          
          process.exit(res.statusCode === 200 ? 0 : 1);
        } catch (e) {
          console.error("Failed to parse response:", body);
          process.exit(1);
        }
      });
    });

    req.on("error", (e) => {
      console.error("Request error:", e.message);
      console.error("Is the server running? (node src/server.js)");
      process.exit(1);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.error("Test setup error:", err);
    process.exit(1);
  }
}

runTest();
