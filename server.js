const express = require("express");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const cors = require("cors");
const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

let userSecret = ""; // This will be generated for the user

// Endpoint to generate a Google Authenticator secret and QR code
app.post("/generate-mfa", (req, res) => {
  // Generate a new secret for the user
  const secret = speakeasy.generateSecret({ length: 20 });
  userSecret = secret.base32; // Save the secret (store securely in a real app)

  // Generate a QR code URL to link with Google Authenticator
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) {
      return res.status(500).send("Error generating QR code");
    }
    res.status(200).json({
      message: "MFA setup successful",
      qr_code_url: data_url,
    });
  });
});

// Endpoint to verify OTP entered by the user
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  // Verify the OTP using the stored secret
  const verified = speakeasy.totp.verify({
    secret: userSecret,
    encoding: "base32",
    token: otp,
    window: 1, // Allowing a 1-step window for time drift
  });

  if (verified) {
    return res.status(200).json({ message: "OTP verified successfully" });
  }
  res.status(400).json({ message: "Invalid OTP" });
});

// Login route (with email/password check)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Example: Hardcoded user credentials check
  if (email === "test@example.com" && password === "password123") {
    return res.status(200).json({ success: true });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
