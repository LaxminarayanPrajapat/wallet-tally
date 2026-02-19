module.exports = [
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/src/lib/email.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendMail",
    ()=>sendMail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-rsc] (ecmascript)");
__turbopack_context__.r("[project]/node_modules/dotenv/lib/main.js [app-rsc] (ecmascript)").config();
;
async function sendMail({ to, subject, text, html, attachments }) {
    const requiredEnvVars = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'SMTP_FROM'
    ];
    const missingVars = requiredEnvVars.filter((v)=>!process.env[v]);
    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables for sending email: ${missingVars.join(', ')}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    console.log('--- Environment Variables for Nodemailer ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[SET]' : '[NOT SET]'); // Don't log the actual password
    console.log('SMTP_FROM:', process.env.SMTP_FROM);
    console.log('-------------------------------------------');
    const transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html,
        attachments
    };
    return transporter.sendMail(mailOptions);
}
}),
"[project]/src/app/actions/email.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"603917732a5e1ba7254bbdb290784cb2f56e10db08":"sendTestEmail","607f36da0129b9503187b22f20b54e0366fe5210f4":"sendOtpEmail","60d57dee910c9908ce18a2f95dce8693ce4b7d57bd":"sendFeedbackApprovalEmail","7021a8a5ada59d1eed403eb6bf06667ab40735cda5":"sendAccountDeletionEmail","70353eebad8696c0d4ad448d75916a4f4f44683cde":"sendPasswordResetOtpEmail","70ecb34a8f97a539764cf657aaa853eb9de295be85":"sendFeedbackDeletionEmail","78c970b752a13f0825b5f559b39d197eda6ca2b5b4":"sendUserWarningEmail"},"",""] */ __turbopack_context__.s([
    "sendAccountDeletionEmail",
    ()=>sendAccountDeletionEmail,
    "sendFeedbackApprovalEmail",
    ()=>sendFeedbackApprovalEmail,
    "sendFeedbackDeletionEmail",
    ()=>sendFeedbackDeletionEmail,
    "sendOtpEmail",
    ()=>sendOtpEmail,
    "sendPasswordResetOtpEmail",
    ()=>sendPasswordResetOtpEmail,
    "sendTestEmail",
    ()=>sendTestEmail,
    "sendUserWarningEmail",
    ()=>sendUserWarningEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/email.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$firebase$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/firebase/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
/**
 * @fileOverview Server actions to securely send automated emails and log them for administration.
 */ async function logEmail(data) {
    try {
        const { firestore } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$firebase$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeFirebase"])();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(firestore, 'email_logs'), {
            ...data,
            admin: 'System',
            sentAt: new Date().toISOString()
        });
    } catch (err) {
        // Log to server console if Firestore logging fails
        console.error('[Action: EmailLog] Failed to log communication to Firestore:', err);
    }
}
async function sendOtpEmail(email, otp) {
    const subject = 'Your Wallet Tally Verification Code';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `Your verification code is: ${otp}`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #23414d; text-align: center;">Welcome to Wallet Tally!</h2>
          <p>Please use the following 6-digit code to verify your email address:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #f4f7f8; display: block; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">This code was requested for your account registration. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Sent by Wallet Tally Secure Verification System</p>
        </div>
      `
        });
        await logEmail({
            type: 'OTP Verification',
            recipientEmail: email,
            recipientName: 'New User',
            subject,
            status: 'Success'
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] OTP Error:', error);
        await logEmail({
            type: 'OTP Verification',
            recipientEmail: email,
            recipientName: 'New User',
            subject,
            status: 'Failed',
            reason: error.message
        });
        return {
            success: false,
            error: error.message
        };
    }
}
async function sendPasswordResetOtpEmail(email, otp, userName) {
    const subject = 'Wallet Tally: Password Reset Request';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `Your password reset code is: ${otp}`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password. Use the following 6-digit code to proceed:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #f8fafc; display: block; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; color: #1e3a8a;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Wallet Tally Secure Account Services</p>
        </div>
      `
        });
        await logEmail({
            type: 'Password Reset',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Success'
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] Reset OTP Error:', error);
        await logEmail({
            type: 'Password Reset',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Failed',
            reason: error.message
        });
        return {
            success: false,
            error: error.message
        };
    }
}
async function sendTestEmail(email, userName) {
    const subject = 'Wallet Tally: System Connection Test';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `This is a test email dispatched from the Wallet Tally administrative tools.`,
            html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a; text-align: center;">Connection Test Success</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>This email confirms that your SMTP configuration is operational and Wallet Tally can successfully dispatch communications.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #dcfce7; color: #166534;">
            <strong>Test Details:</strong><br/>
            Timestamp: ${new Date().toLocaleString()}<br/>
            Source: Administrative Tools
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Wallet Tally Diagnostic Services</p>
        </div>
      `
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] Test Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function sendFeedbackApprovalEmail(email, userName) {
    const subject = 'Your feedback has been featured on Wallet Tally!';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `Hi ${userName}, thank you for your wonderful feedback. We have selected your review to be featured as a testimonial on our home page!`,
            html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations, ${userName}!</h2>
          <p>We are thrilled to inform you that your feedback has been selected to be featured as a <strong>Testimonial</strong> on the Wallet Tally home page.</p>
          <p>We truly appreciate the time you took to share your experience.</p>
          <p>Thank you for being a valued member of Wallet Tally.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent with ❤️ from the Wallet Tally Team</p>
        </div>
      `
        });
        await logEmail({
            type: 'Appreciation',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Success'
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] Approval Email Error:', error);
        await logEmail({
            type: 'Appreciation',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Failed',
            reason: error.message
        });
        return {
            success: false,
            error: error.message
        };
    }
}
async function sendFeedbackDeletionEmail(email, userName, reason) {
    const subject = 'Update regarding your feedback on Wallet Tally';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `Hi ${userName}, we are reaching out to inform you that your recent feedback has been removed. Reason: ${reason}`,
            html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Feedback Status Update</h2>
          <p>Hi ${userName},</p>
          <p>We are writing to inform you that your recently submitted feedback has been removed from our system.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #fee2e2;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">Reason for removal:</p>
            <p style="margin: 8px 0 0 0; color: #b91c1c;">${reason}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Wallet Tally Moderation Service</p>
        </div>
      `
        });
        await logEmail({
            type: 'Feedback Deletion',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Success',
            reason
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] Deletion Email Error:', error);
        await logEmail({
            type: 'Feedback Deletion',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Failed',
            reason: error.message
        });
        return {
            success: false,
            error: error.message
        };
    }
}
async function sendUserWarningEmail(email, userName, violationType, detailedReason) {
    const subject = 'Important: Official Account Warning - Wallet Tally';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `Hi ${userName}, this is an official warning regarding your account activity on Wallet Tally. Violation: ${violationType}`,
            html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; text-align: center;">⚠️ Account Warning</h1>
          <p>Hi <strong>${userName}</strong>,</p>
          <div style="background: #fffbeb; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #fef3c7;">
            <p style="margin: 0; font-weight: bold; color: #92400e; text-transform: uppercase; font-size: 12px;">Violation Type:</p>
            <p style="margin: 8px 0 0 0; color: #b45309; font-size: 18px; font-weight: bold;">${violationType}</p>
            ${detailedReason ? `
              <p style="margin: 16px 0 0 0; font-weight: bold; color: #92400e; text-transform: uppercase; font-size: 12px;">Administrative Note:</p>
              <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px; line-height: 1.6; font-style: italic;">"${detailedReason}"</p>
            ` : ''}
          </div>
          <p>Please review our Terms of Service to ensure your future activity remains in compliance.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">OFFICIAL NOTICE FROM WALLET TALLY ADMINISTRATION</p>
        </div>
      `
        });
        await logEmail({
            type: 'Warning',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Success',
            reason: detailedReason ? `${violationType}: ${detailedReason}` : violationType
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] Warning Error:', error);
        await logEmail({
            type: 'Warning',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Failed',
            reason: error.message
        });
        return {
            success: false,
            error: error.message
        };
    }
}
async function sendAccountDeletionEmail(email, userName, reason) {
    const subject = 'Your Wallet Tally account has been terminated';
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendMail"])({
            to: email,
            subject,
            text: `Hi ${userName}, your account has been terminated by an administrator. Reason: ${reason}`,
            html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Account Termination Notice</h2>
          <p>Hi ${userName},</p>
          <p>We are writing to inform you that your Wallet Tally account associated with this email has been permanently terminated by our administration team.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-weight: bold; color: #475569;">Official Reason:</p>
            <p style="margin: 8px 0 0 0; color: #64748b; font-style: italic;">"${reason}"</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">If you believe this was a mistake, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">WALLET TALLY ADMINISTRATIVE SERVICES</p>
        </div>
      `
        });
        await logEmail({
            type: 'Account Deletion',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Success',
            reason
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('[SMTP] Termination Error:', error);
        await logEmail({
            type: 'Account Deletion',
            recipientEmail: email,
            recipientName: userName,
            subject,
            status: 'Failed',
            reason: error.message
        });
        return {
            success: false,
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    sendOtpEmail,
    sendPasswordResetOtpEmail,
    sendTestEmail,
    sendFeedbackApprovalEmail,
    sendFeedbackDeletionEmail,
    sendUserWarningEmail,
    sendAccountDeletionEmail
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendOtpEmail, "607f36da0129b9503187b22f20b54e0366fe5210f4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendPasswordResetOtpEmail, "70353eebad8696c0d4ad448d75916a4f4f44683cde", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendTestEmail, "603917732a5e1ba7254bbdb290784cb2f56e10db08", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendFeedbackApprovalEmail, "60d57dee910c9908ce18a2f95dce8693ce4b7d57bd", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendFeedbackDeletionEmail, "70ecb34a8f97a539764cf657aaa853eb9de295be85", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendUserWarningEmail, "78c970b752a13f0825b5f559b39d197eda6ca2b5b4", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendAccountDeletionEmail, "7021a8a5ada59d1eed403eb6bf06667ab40735cda5", null);
}),
"[project]/.next-internal/server/app/otp-verification/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions/email.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/email.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/otp-verification/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions/email.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "607f36da0129b9503187b22f20b54e0366fe5210f4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendOtpEmail"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$otp$2d$verification$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/otp-verification/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions/email.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$email$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/email.ts [app-rsc] (ecmascript)");
}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/src/app/icon.svg.mjs { IMAGE => \"[project]/src/app/icon.svg (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/icon.svg.mjs { IMAGE => \"[project]/src/app/icon.svg (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/app/otp-verification/page.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/otp-verification/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/otp-verification/page.tsx <module evaluation>", "default");
}),
"[project]/src/app/otp-verification/page.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/otp-verification/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/otp-verification/page.tsx", "default");
}),
"[project]/src/app/otp-verification/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$otp$2d$verification$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/otp-verification/page.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$otp$2d$verification$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/app/otp-verification/page.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$otp$2d$verification$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/app/otp-verification/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/otp-verification/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9ad53b5d._.js.map