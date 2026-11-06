const KENYA = {
  black: "#0e1116",
  panel: "#161b23",
  text: "#e8ecf2",
  muted: "#9aa4b2",
  red: "#bb0000",
  green: "#006600",
  gold: "#f5a623",
  line: "#2a3240",
};

const brandBar = () => `
  <tr>
    <td style="padding:0;line-height:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" height="6" style="background:${KENYA.black}"></td>
          <td width="33%" height="6" style="background:${KENYA.red}"></td>
          <td width="34%" height="6" style="background:${KENYA.green}"></td>
        </tr>
      </table>
    </td>
  </tr>`;

const footer = ({ supportPhone, supportEmail, brandName }) => `
  <tr>
    <td style="padding:24px 28px;border-top:1px solid ${KENYA.line};background:${KENYA.black};">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${KENYA.text};">${brandName}</p>
      <p style="margin:0 0 4px;font-size:12px;color:${KENYA.muted};">
        Need help? <a href="mailto:${supportEmail}" style="color:${KENYA.gold};text-decoration:none;">${supportEmail}</a>
        &nbsp;·&nbsp; <a href="tel:${supportPhone}" style="color:${KENYA.gold};text-decoration:none;">${supportPhone}</a>
      </p>
      <p style="margin:0;font-size:11px;color:${KENYA.muted};">Ngong Rd, Nairobi · Kenya</p>
    </td>
  </tr>`;

const layout = ({ title, body, brandName, supportPhone, supportEmail }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${KENYA.black};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${KENYA.black};padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${KENYA.panel};border-radius:14px;overflow:hidden;">
          ${brandBar()}
          <tr>
            <td style="padding:28px 28px 8px;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:${KENYA.text};letter-spacing:0.2px;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;font-size:14px;line-height:1.6;color:${KENYA.text};">
              ${body}
            </td>
          </tr>
          ${footer({ supportPhone, supportEmail, brandName })}
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

const btn = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:${KENYA.green};color:#ffffff;font-weight:700;font-size:14px;padding:12px 20px;border-radius:8px;text-decoration:none;">${label}</a>`;

export const otpCode = ({ code, ttlMinutes, brandName, supportPhone, supportEmail }) => ({
  subject: `${brandName} — Your login code`,
  html: layout({
    title: "Your login code",
    brandName, supportPhone, supportEmail,
    body: `
      <p style="margin:0 0 12px;">Use the code below to log in. It expires in <strong>${ttlMinutes} minutes</strong>.</p>
      <div style="display:inline-block;background:${KENYA.black};border:1px solid ${KENYA.line};border-radius:10px;padding:14px 22px;font-size:30px;font-weight:800;letter-spacing:8px;color:${KENYA.gold};margin:8px 0 16px;">${code}</div>
      <p style="margin:0;color:${KENYA.muted};font-size:13px;">Never share this code with anyone.</p>
    `,
  }),
  text: `${brandName} login code: ${code}. Expires in ${ttlMinutes} min.`,
});

export const notifyConfirm = ({ matchName, confirmUrl, brandName, supportPhone, supportEmail }) => ({
  subject: `Confirm your interest — ${matchName}`,
  html: layout({
    title: "You're on the list",
    brandName, supportPhone, supportEmail,
    body: `
      <p style="margin:0 0 16px;">You asked to be notified when tickets for <strong>${matchName}</strong> go on sale.</p>
      <p style="margin:0 0 16px;">${btn(confirmUrl, "Confirm interest")}</p>
      <p style="margin:0;color:${KENYA.muted};font-size:12px;">If you didn't request this, ignore this email.</p>
    `,
  }),
  text: `Confirm your interest for ${matchName}: ${confirmUrl}`,
});

export const ticketReady = ({ matchName, gate, seat, qrUrl, brandName, supportPhone, supportEmail }) => ({
  subject: `Your ticket — ${matchName}`,
  html: layout({
    title: "Your ticket is ready",
    brandName, supportPhone, supportEmail,
    body: `
      <p style="margin:0 0 12px;font-weight:700;color:${KENYA.gold};">${matchName}</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;font-size:14px;">
        <tr><td style="padding:4px 16px 4px 0;color:${KENYA.muted};">Gate</td><td style="font-weight:700;">${gate}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:${KENYA.muted};">Seat</td><td style="font-weight:700;">${seat}</td></tr>
      </table>
      <p style="margin:0;">${btn(qrUrl, "View QR ticket")}</p>
    `,
  }),
  text: `Your ticket for ${matchName}. Gate ${gate}, Seat ${seat}. View: ${qrUrl}`,
});

export const paymentSuccess = ({ matchName, amount, receipt, brandName, supportPhone, supportEmail }) => ({
  subject: `Payment received — ${matchName}`,
  html: layout({
    title: "Payment received",
    brandName, supportPhone, supportEmail,
    body: `
      <p style="margin:0 0 8px;">We received <strong style="color:${KENYA.green};">KSh ${amount}</strong> for ${matchName}.</p>
      <p style="margin:0;color:${KENYA.muted};font-size:13px;">Reference: ${receipt}</p>
    `,
  }),
  text: `Payment of KSh ${amount} received for ${matchName}. Ref ${receipt}.`,
});

export const paymentFailed = ({ matchName, brandName, supportPhone, supportEmail }) => ({
  subject: `Payment failed — ${matchName}`,
  html: layout({
    title: "Payment failed",
    brandName, supportPhone, supportEmail,
    body: `
      <p style="margin:0 0 12px;">Your payment for ${matchName} did not go through.</p>
      <p style="margin:0;color:${KENYA.muted};font-size:13px;">You can try again at any time. If the amount was deducted, contact support.</p>
    `,
  }),
  text: `Payment for ${matchName} failed. Try again.`,
});

export const bankAwaiting = ({ matchName, reference, bank, brandName, supportPhone, supportEmail }) => ({
  subject: `Bank payment pending — ${matchName}`,
  html: layout({
    title: "Bank payment pending",
    brandName, supportPhone, supportEmail,
    body: `
      <p style="margin:0 0 12px;">Please transfer to:</p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;font-size:14px;">
        <tr><td style="padding:4px 16px 4px 0;color:${KENYA.muted};">Bank</td><td style="font-weight:700;">${bank.bankName}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:${KENYA.muted};">Account</td><td style="font-weight:700;">${bank.accountName}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:${KENYA.muted};">Number</td><td style="font-weight:700;">${bank.accountNumber}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:${KENYA.muted};">Reference</td><td style="font-weight:700;color:${KENYA.gold};">${reference}</td></tr>
      </table>
      <p style="margin:0;color:${KENYA.muted};font-size:13px;">Your tickets will be issued once payment is confirmed.</p>
    `,
  }),
  text: `Bank payment for ${matchName} pending. Ref ${reference}.`,
});