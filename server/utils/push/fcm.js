const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  try {
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!filePath) {
      console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_PATH missing. Push will not work.");
      return;
    }

    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Firebase service account file not found at: ${fullPath}`);
      return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("❌ Firebase init error:", err.message);
  }
}

async function sendPushToTokens(tokens, payload) {
  initFirebase();

  if (!initialized) {
    return { successCount: 0, failureCount: tokens.length };
  }

  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const chunkSize = 500;
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);

    const message = {
      tokens: chunk,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    successCount += response.successCount;
    failureCount += response.failureCount;
  }

  return { successCount, failureCount };
}

module.exports = { sendPushToTokens };
