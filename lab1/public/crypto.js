async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  return await crypto.subtle.digest('SHA-256', data);
}

async function importAesKey(rawKeyBuffer) {
  return await crypto.subtle.importKey(
    'raw',
    rawKeyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

function generateIv() {
  return crypto.getRandomValues(new Uint8Array(12));
}

async function encryptData(key, data, iv) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  return await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );
}

async function decryptData(key, ciphertextBuffer, iv) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertextBuffer
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
