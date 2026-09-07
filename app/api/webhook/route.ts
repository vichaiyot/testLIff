import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const LINE_BOT_API_URL = "https://api.line.me/v2/bot";
const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
};

const RICHMENU_DEFAULT = process.env.RICHMENU_DEFAULT || "";
const RICHMENU_GREETING = process.env.RICHMENU_GREETING || "";

const KEYWORDS_DEFAULT = [
    "ขอถอนตัว",
    "ถอนตัว",
    "ยกเลิก",
    "ยกเลิกสมาชิก",
    "ออกจากระบบ",
    "ไม่เอาแล้ว",
    "ขอออก",
];

const KEYWORDS_GREETING = [
    "สมัครสมาชิก",
    "สมัคร",
    "อยากสมัคร",
    "สมัครเลย",
    "เข้าร่วม",
    "อยากเข้าร่วม",
    "ลงทะเบียน",
];

const updateRichmenu = async (userId: string, richMenuId: string) => {
    const response = await axios.post(
        `${LINE_BOT_API_URL}/user/${userId}/richmenu/${richMenuId}`,
        {},
        { headers }
    );
    return response;
};

// ตอบกลับด้วย replyToken (ฟรี ไม่กินโควต้า push message)
const replyMessage = async (replyToken: string, message: string) => {
    const body = {
        replyToken,
        messages: [
            {
                type: "text",
                text: message,
            },
        ],
    };
    const response = await axios.post(LINE_REPLY_URL, body, { headers });
    return response;
};

const matchKeyword = (text: string, keywords: string[]) => {
    return keywords.some((keyword) => text.includes(keyword));
};

export async function POST(req: NextRequest) {
    const text = await req.text();

    if (!text) {
        return NextResponse.json({ message: "OK" });
    }

    let body;
    try {
        body = JSON.parse(text);
    } catch (err) {
        console.log("invalid JSON body", err);
        return NextResponse.json({ message: "invalid body" });
    }

    const { events } = body;

    if (!events || events.length <= 0) {
        console.log("error event not found");
        return NextResponse.json({ message: "event not found !" });
    }

    try {
        const lineEvent = events[0];
        const lineUserID = lineEvent.source.userId;
        const replyToken = lineEvent.replyToken;
        let targetRichMenuId = "";
        let replyText = "";

        if (lineEvent.type === "message" && lineEvent.message.type === "text") {
            const messageText = lineEvent.message.text.trim();

            if (matchKeyword(messageText, KEYWORDS_DEFAULT)) {
                targetRichMenuId = RICHMENU_DEFAULT;
                replyText = "ดำเนินการถอนตัวเรียบร้อยแล้วค่ะ";
            } else if (matchKeyword(messageText, KEYWORDS_GREETING)) {
                targetRichMenuId = RICHMENU_GREETING;
                replyText = "สมัครสมาชิกเรียบร้อยแล้วค่ะ ยินดีต้อนรับ 🎉";
            }
        }

        if (targetRichMenuId) {
            const richmenuResponse = await updateRichmenu(lineUserID, targetRichMenuId);
            console.log("=== LINE richmenu log", richmenuResponse.data);
        }

        if (replyText && replyToken) {
            const replyResponse = await replyMessage(replyToken, replyText);
            console.log("=== LINE reply log", replyResponse.data);
        }

        return NextResponse.json({ message: "OK" });
    } catch (error) {
        console.log("error", error);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}