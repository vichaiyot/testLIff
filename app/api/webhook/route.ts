import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const LINE_BOT_API_URL = "https://api.line.me/v2/bot";

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
};

const RICHMENU_DEFAULT = "richmenu-909fa08919cae7a9b4f0be94b0633afc";
const RICHMENU_GREETING = "richmenu-d658ebb4a60aa9f920ff67c6b1bde5ab";

// คำที่ user อาจพิมพ์มาใกล้เคียงกัน สำหรับแต่ละคำสั่ง
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

// เช็คว่าข้อความ user มีคำใน keyword list ไหนอยู่หรือไม่ (แบบ contains ไม่ต้อง exact match)
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
        let targetRichMenuId = "";

        if (lineEvent.type === "message" && lineEvent.message.type === "text") {
            const messageText = lineEvent.message.text.trim();

            if (matchKeyword(messageText, KEYWORDS_DEFAULT)) {
                targetRichMenuId = RICHMENU_DEFAULT;
            } else if (matchKeyword(messageText, KEYWORDS_GREETING)) {
                targetRichMenuId = RICHMENU_GREETING;
            }
        }

        if (targetRichMenuId) {
            const response = await updateRichmenu(lineUserID, targetRichMenuId);
            console.log("=== LINE log", response.data);
        }

        return NextResponse.json({ message: "OK" });
    } catch (error) {
        console.log("error", error);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}