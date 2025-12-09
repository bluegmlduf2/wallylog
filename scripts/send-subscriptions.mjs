#!/usr/bin/env node
/*
  scripts/send-subscriptions.mjs

  - Fetches open GitHub issues labeled `approved` (or configured APPROVED_LABEL) from GITHUB_REPOSITORY
  - For each issue extracts email, items, and template from issue body
*/

import process from "process";
import nodemailer from "nodemailer";

const API_BASE = "https://api.github.com";

function exitWith(msg, code = 1) {
    console.error(msg);
    process.exit(code);
}

const {
    GITHUB_TOKEN,
    GITHUB_REPOSITORY,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM, // 보내는 이메일
    SMTP_FROM_NAME = "WallyLog",
    SMTP_GITHUB_USER_EMAIL,
} = process.env;

if (!GITHUB_TOKEN) exitWith("GITHUB_TOKEN missing");
if (!GITHUB_REPOSITORY) exitWith("GITHUB_REPOSITORY missing");
if (!SMTP_HOST) exitWith("SMTP_HOST missing");
if (!SMTP_PORT) exitWith("SMTP_PORT missing");
if (!SMTP_USER) exitWith("SMTP_USER missing");
if (!SMTP_PASS) exitWith("SMTP_PASS missing");
// SMTP_FROM is the from-address used for outgoing emails
if (!SMTP_FROM) exitWith("SMTP_FROM missing");
if (!SMTP_GITHUB_USER_EMAIL) exitWith("SMTP_GITHUB_USER_EMAIL missing");

const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
};

async function listApprovedIssues() {
    const labelQuery = "approved";
    const url = `${API_BASE}/repos/${GITHUB_REPOSITORY}/issues?state=open&labels=${labelQuery}&per_page=100&creator=${SMTP_GITHUB_USER_EMAIL}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw new Error(`list issues failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

async function postComment(issueNumber, body) {
    const url = `${API_BASE}/repos/${GITHUB_REPOSITORY}/issues/${issueNumber}/comments`;
    const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ body }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`comment failed: ${res.status} ${text}`);
    }
    return res.json();
}

function parseIssueBody(body) {
    // expect lines like: - 이메일: user@example.com
    const get = (key) => {
        const re = new RegExp(`${key}:\\s*(.+)`, "i");
        const match = body.match(re);
        return match ? match[1].trim() : "";
    };

    const email = get("이메일");
    const itemsText = get("구독 항목");

    const items = itemsText
        ? itemsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    return { email, items };
}

function renderByTemplate(items) {
    // basic template rendering — expand as needed
    const subject = "WallyLog — 오늘의 소식";

    let body = `안녕하세요!\n\nWallyLog에서 선택하신 항목(${items.join(
        ", "
    )})의 최신 소식입니다.\n\n간단한 포인트 중심으로 전해드립니다.`;

    const html =
        `<div style="font-family: system-ui, -apple-system, Roboto, 'Noto Sans KR', 'Segoe UI', 'Helvetica Neue', Arial; color: #0f172a;">` +
        `<h2>${subject}</h2><p>${body.replace(/\n/g, "<br/>")}</p>` +
        `<hr/><small>구독 해지/관리: GitHub 이슈에서 상태를 변경하거나 관리자에게 문의하세요.</small></div>`;

    return { subject, text: body, html };
}

// Nodemailer transporter 생성
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465는 SSL
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

// Nodemailer로 이메일 발송 함수
async function sendEmailNodemailer(to, subject, text, html) {
    const mailOptions = {
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
        to,
        subject,
        text,
        html,
    };
    try {
        await transporter.sendMail(mailOptions);
        return { ok: true };
    } catch (err) {
        return { ok: false, status: err.code || 500, body: err.message };
    }
}

async function main() {
    console.log("Starting send-subscriptions job");
    const issues = await listApprovedIssues();
    console.log(`Found ${issues.length} open issues with label approved`);

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (const issue of issues) {
        try {
            const issueNumber = issue.number;
            const body = issue.body || "";
            const meta = parseIssueBody(body);

            if (!meta.email) {
                console.warn(
                    `#${issueNumber} - email not found in issue body, skipping`
                );
                await postComment(
                    issueNumber,
                    `⚠️ 발송 실패: 이메일을 분해할 수 없습니다. (issue body에 '이메일: your@example.com' 형식으로 있어야 합니다.)`
                );
                skippedCount++;
                continue;
            }

            const { subject, text, html } = renderByTemplate(meta.items);

            // send
            const sendRes = await sendEmailNodemailer(
                meta.email,
                subject,
                text,
                html
            );

            if (sendRes.ok) {
                const now = new Date().toISOString();
                const comment = `📤 ${now} 발송 완료 — 템플릿: ${
                    meta.template
                }; 항목: ${meta.items.join(", ")}`;
                await postComment(issueNumber, comment);
                console.log(`#${issueNumber} - sent to ${meta.email}`);
                successCount++;
            } else {
                const now = new Date().toISOString();
                const comment = `⚠️ ${now} 발송 실패 — status: ${
                    sendRes.status
                }; resp: ${String(sendRes.body).slice(0, 100)}`;
                await postComment(issueNumber, comment);
                console.warn(
                    `#${issueNumber} - failed send ${meta.email}`,
                    sendRes
                );
                failCount++;
            }
        } catch (err) {
            console.error("issue loop error", err);
            failCount++;
        }
    }

    console.log(
        `done. sent=${successCount} skipped=${skippedCount} failed=${failCount}`
    );
}

main().catch((err) => {
    console.error("fatal error", err);
    process.exit(2);
});
