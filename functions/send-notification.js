// netlify/functions/send-notification.js
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

// تهيئة Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "codeacademy-fdea6",
      clientEmail: "firebase-adminsdk-fbsvc@codeacademy-fdea6.iam.gserviceaccount.com",
      privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "https://littelprogrammer.netlify.app",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { tokens, title, body, icon, url } = JSON.parse(event.body || "{}");

    if (!tokens || !tokens.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No tokens provided" }) };
    }
    if (!title || !body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Title and body required" }) };
    }

    const messaging = getMessaging();
    const results = { success: 0, failed: 0, errors: [] };

    // نبعت لكل token على حدة عشان نتتبع الأخطاء
    for (const token of tokens) {
      try {
        await messaging.send({
          token,
          notification: { title, body },
          webpush: {
            notification: {
              title,
              body,
              icon: icon || "/icon-192.png",
              badge: "/icon-96.png",
              requireInteraction: false,
              vibrate: [200, 100, 200],
            },
            fcmOptions: { link: url || "https://littelprogrammer.netlify.app/" },
          },
        });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ token: token.substring(0, 20) + "...", error: err.message });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, ...results }),
    };
  } catch (err) {
    console.error("FCM error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
