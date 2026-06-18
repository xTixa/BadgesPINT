import crypto from "crypto";
import FcmToken from "../models/FcmToken.js";

let cachedAccessToken = null;
let tokenExpiresAt = 0;

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hasFirebaseConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const claim = {
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsignedJwt = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(claim)
  )}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsignedJwt)
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${unsignedJwt}.${signature}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OAuth Firebase falhou: ${response.status} ${body}`);
  }

  const payload = await response.json();
  cachedAccessToken = payload.access_token;
  tokenExpiresAt = Date.now() + payload.expires_in * 1000;
  return cachedAccessToken;
}

async function sendToToken(accessToken, token, notification) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: notification.titulo,
            body: notification.mensagem,
          },
          data: {
            notificationId: String(notification.id),
            tipo: notification.tipo ?? "geral",
            titulo: notification.titulo ?? "",
            mensagem: notification.mensagem ?? "",
          },
          android: {
            priority: "HIGH",
            notification: {
              channel_id: "badges_alerts",
            },
          },
        },
      }),
    }
  );

  if (response.ok) return true;

  const body = await response.text();
  if (
    body.includes("UNREGISTERED") ||
    body.includes("INVALID_ARGUMENT") ||
    body.includes("registration-token-not-registered")
  ) {
    return false;
  }

  throw new Error(`FCM falhou: ${response.status} ${body}`);
}

export async function sendPushToUser(utilizadorId, notification) {
  if (!hasFirebaseConfig()) {
    console.warn(
      "Firebase push desativado: faltam FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ou FIREBASE_PRIVATE_KEY no .env"
    );
    return;
  }

  const tokens = await FcmToken.findAll({
    where: {
      utilizador_id: utilizadorId,
      ativo: true,
    },
  });

  if (tokens.length === 0) {
    console.warn(`Firebase push nao enviado: utilizador ${utilizadorId} sem token FCM ativo`);
    return;
  }

  const accessToken = await getAccessToken();
  const invalidTokens = [];

  await Promise.all(
    tokens.map(async (item) => {
      const valid = await sendToToken(accessToken, item.token, notification);
      if (!valid) invalidTokens.push(item.token);
    })
  );

  if (invalidTokens.length > 0) {
    await FcmToken.update(
      { ativo: false },
      { where: { token: invalidTokens } }
    );
  }
}

export async function sendPushToUsers(utilizadorIds, notification) {
  await Promise.all(
    utilizadorIds.map((utilizadorId) => sendPushToUser(utilizadorId, notification))
  );
}
