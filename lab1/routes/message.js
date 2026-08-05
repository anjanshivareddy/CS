const express = require("express");
const router = express.Router();
const db = require("../db");
const { page } = require("../views");

router.get("/set-message", (req, res) => {
  if (!req.cookies.username) {
    return res.redirect("/");
  }

  res.send(page("Set My Message", `
    <h1>✏️ Set My Message</h1>
    <p class="subtitle">This will be encrypted in your browser before it's saved.</p>
    <form id="message-form" method="POST" action="/set-message">
      <label>Your password</label>
      <input type="password" id="password" placeholder="Enter your password" required>
      <label>Your message</label>
      <input type="text" id="plaintext" placeholder="Say something fun!" required autofocus>
      
      <input type="hidden" name="message" id="ciphertext">
      <input type="hidden" name="message_iv" id="iv">
      
      <button type="submit" class="btn btn-yellow">Encrypt & Save 💾</button>
    </form>
    <a href="/account" class="btn btn-pink" style="margin-top: 14px; display:inline-block;">Back</a>

    <script src="/public/crypto.js"></script>
    <script>
      document.getElementById('message-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const plaintext = document.getElementById('plaintext').value;
        
        try {
          const hashBuffer = await hashPassword(password);
          const key = await importAesKey(hashBuffer);
          const iv = generateIv();
          
          const encryptedBuffer = await encryptData(key, plaintext, iv);
          
          document.getElementById('ciphertext').value = arrayBufferToBase64(encryptedBuffer);
          document.getElementById('iv').value = arrayBufferToBase64(iv.buffer || iv);
          
          document.getElementById('plaintext').value = '';
          document.getElementById('password').value = '';
          
          e.target.submit();
        } catch (err) {
          alert('Encryption failed');
          console.error(err);
        }
      });
    </script>
  `));
});

router.post("/set-message", (req, res) => {
  if (!req.cookies.username) {
    return res.redirect("/");
  }

  db.prepare("UPDATE accounts SET message = ?, message_iv = ? WHERE username = ?").run(
    req.body.message,
    req.body.message_iv,
    req.cookies.username
  );

  res.redirect("/account");
});

module.exports = router;
