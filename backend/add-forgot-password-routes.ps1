# PharmaVerse: safely add password-reset routes to the original auth.js
# Run this script from: PharmaVerse\backend
# It uses auth-backup-859.js as the source and preserves all existing routes.

$ErrorActionPreference = "Stop"

$backup = Join-Path (Get-Location) "auth-backup-859.js"
$target = Join-Path (Get-Location) "routes\auth.js"

if (!(Test-Path $backup)) {
    throw "Backup not found: $backup. Run this from the backend folder and confirm auth-backup-859.js exists."
}

$source = Get-Content -LiteralPath $backup -Raw

if ($source -match 'router\.post\(["'']\/forgot-password') {
    throw "The backup already contains a forgot-password route. No changes made to avoid duplicate routes."
}

if ($source -notmatch 'const nodemailer\s*=\s*require\(["'']nodemailer["'']\)') {
    $cryptoImport = 'const crypto = require("crypto");'
    if ($source.Contains($cryptoImport)) {
        $source = $source.Replace($cryptoImport, $cryptoImport + "`r`nconst nodemailer = require('nodemailer');")
    } else {
        throw "Could not find the crypto import to add nodemailer safely."
    }
}

$routes = @'
// =========================================================
// FORGOT PASSWORD - EMAIL OTP
// =========================================================
const passwordResetMailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD
  }
});

const hashPasswordResetValue = (value) =>
  crypto.createHash('sha256').update(value).digest('hex');

// Request a reset OTP. Email + mobile must both match.
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const mobile = String(req.body.mobile || '').trim();

    if (!email || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Email and mobile number are required.'
      });
    }

    const user = await User.findOne({
      email,
      mobile,
      isActive: { $ne: false }
    }).select(
      '+passwordResetOtpHash +passwordResetOtpExpires ' +
      '+passwordResetAttempts +passwordResetLastSent ' +
      '+passwordResetTokenHash +passwordResetTokenExpires'
    );

    // Avoid disclosing whether an account exists.
    const genericResponse = {
      success: true,
      message: 'If the details match an account, an OTP will be sent to its email.'
    };

    if (!user) return res.status(200).json(genericResponse);

    const now = Date.now();
    if (
      user.passwordResetLastSent &&
      now - new Date(user.passwordResetLastSent).getTime() < 60000
    ) {
      return res.status(429).json({
        success: false,
        message: 'Please wait one minute before requesting another OTP.'
      });
    }

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
      console.error('Password reset SMTP environment variables are missing.');
      return res.status(500).json({
        success: false,
        message: 'Email service is temporarily unavailable.'
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await passwordResetMailer.sendMail({