const fs = require("fs");
const path = require("path");

const LOG_FOLDER = path.join(__dirname, "logs");

// Ensure logs folder exists
if (!fs.existsSync(LOG_FOLDER)) fs.mkdirSync(LOG_FOLDER);

const logsData = [
  `[INFO] Server initialized
[DEBUG] Config loaded: default.json
[INFO] Database connection established
[WARN] Slow query detected
[ERROR] Failed to send email: SMTP timeout
[INFO] Retrying email send
[INFO] Email sent successfully
[DEBUG] Session token generated
[INFO] Cleanup job started
[INFO] Cleanup job completed`,

  `[INFO] Build process started
[DEBUG] Reading configuration: build.json
[ERROR] Missing module: react-dom
[INFO] Installing dependencies
[INFO] Build step 1 completed
[WARN] Deprecated API used: fs.existsSync
[DEBUG] Checking file permissions
[ERROR] Permission denied: /var/log/build.log
[INFO] Build completed with warnings`,

  `[INFO] Starting AI analysis
[DEBUG] Model gemini-2.5-flash loaded
[INFO] Analysis started
[ERROR] Invalid input: empty logs provided
[WARN] Using default logs for retry
[INFO] Analysis completed
[DEBUG] Output length: 1024 characters
[INFO] Report saved to reports/output.json
[ERROR] Directory not found, creating...
[INFO] Report saved successfully`,

  `[INFO] User login attempt
[DEBUG] Checking credentials
[INFO] User authenticated: userId=204
[WARN] Suspicious login location: IP 192.168.1.55
[ERROR] Failed to load user dashboard
[DEBUG] Session timeout reset
[INFO] User redirected to login`,

  `[INFO] Cron job triggered: cleanup-temp
[DEBUG] Scanning temp folder
[INFO] Deleted 12 temporary files
[WARN] Some files could not be deleted: locked by another process
[INFO] Cleanup job completed`,

  `[INFO] API server starting
[DEBUG] Middleware loaded: cors, json parser
[INFO] Listening on port 5000
[ERROR] Route /analyze crashed: TypeError undefined
[DEBUG] Stack trace logged
[INFO] Server health OK`,

  `[INFO] Scheduled task: data backup
[DEBUG] Connecting to S3 bucket
[INFO] Backup started
[ERROR] Network error: S3 unreachable
[INFO] Retrying backup
[INFO] Backup completed successfully`,

  `[INFO] Payment processing started
[DEBUG] Validating credit card
[ERROR] Payment declined: insufficient funds
[WARN] User notified of failed payment
[INFO] Payment retry scheduled`,

  `[INFO] Deploy started: version 2.1.5
[DEBUG] Pulling latest code from repo
[INFO] Build successful
[ERROR] Missing environment variable: DATABASE_URL
[INFO] Deployment halted`,

  `[INFO] AI agent started
[DEBUG] Loading models: gemini-2.5-flash
[INFO] Analyzing logs from previous sessions
[WARN] Partial log corruption detected
[ERROR] Failed to process corrupted log segment
[INFO] Analysis resumed with valid logs
[INFO] Analysis completed`
];

logsData.forEach((content, idx) => {
  const timestamp = Date.now() + idx * 1000;
  const filename = `sample-log-${idx + 1}.txt`;
  const filepath = path.join(LOG_FOLDER, filename);

  fs.writeFileSync(filepath, content, "utf8");
  fs.utimesSync(filepath, new Date(timestamp), new Date(timestamp));
  console.log(`Created ${filename}`);
});

console.log("All 10 sample logs created successfully!");
