const express = require("express");
const router = express.Router();
const db = require("../db");
const { page } = require("../views");

router.get("/account", (req, res) => {
  if (!req.cookies.username) {
    return res.redirect("/");
  }

  const me = db.prepare("SELECT * FROM accounts WHERE username = ?").get(req.cookies.username);
  if (!me) {
    res.clearCookie("username");
    return res.redirect("/");
  }

  const messageBlock = me.message
    ? `<div class="message-box" id="locked-box">
         <p>🔒 Message is locked.</p>
         <input type="password" id="unlock-password" placeholder="Enter your password">
         <button id="unlock-btn" class="btn btn-yellow" style="margin-top: 10px;">Unlock 🔓</button>
       </div>
       <div class="message-box" id="unlocked-box" style="display: none;">
         💬 <strong>${me.display_name}'s message:</strong><br>
         <span id="decrypted-message"></span>
       </div>
       <script src="/public/crypto.js"></script>
       <script>
         document.getElementById('unlock-btn').addEventListener('click', async () => {
           const password = document.getElementById('unlock-password').value;
           const ciphertextBase64 = "${me.message}";
           const ivBase64 = "${me.message_iv}";
           
           try {
             const hashBuffer = await hashPassword(password);
             const key = await importAesKey(hashBuffer);
             
             const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
             const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
             
             const decrypted = await decryptData(key, ciphertextBuffer, iv);
             
             document.getElementById('decrypted-message').textContent = decrypted;
             document.getElementById('locked-box').style.display = 'none';
             document.getElementById('unlocked-box').style.display = 'block';
           } catch (err) {
             alert('Decryption failed. Wrong password?');
             console.error(err);
           }
         });
       </script>`
    : `<div class="message-box empty">💬 No message set yet.</div>`;

  res.send(page("My Page", `
    <h1>👋 Hi, ${me.display_name}!</h1>
    ${messageBlock}
    <div class="button-row">
      <a href="/set-message" class="btn btn-yellow">✏️ Set My Message</a>
      <a href="/change-password" class="btn btn-green">🔑 Change Password</a>
    </div>
    <a href="/logout" class="btn btn-pink" style="margin-top: 14px; display:inline-block;">Log Out</a>
  `));
});

router.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

module.exports = router;
