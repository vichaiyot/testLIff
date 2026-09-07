import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const LINE_BOT_API_URL = "https://api.line.me/v2/bot";

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
};

// กำหนด rich menu ID ตายตัวไว้เลย ไม่ต้องยิง API ไปถาม
const RICHMENU_DEFAULT = "richmenu-eac5dc8a191afbe8f7675a73460efad1";
const RICHMENU_GREETING = "richmenu-cf931e072287e7d39752e0761c420eed";

// ผูก richmenu กับ userId
const updateRichmenu = async (userId: string, richMenuId: string) => {
    const response = await axios.post(
        `${LINE_BOT_API_URL}/user/${userId}/richmenu/${richMenuId}`,
        {},
        { headers }
    );
    return response;
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
            const text = lineEvent.message.text;

            if (text === "อยากกลับบ้าน") {
                targetRichMenuId = RICHMENU_DEFAULT;
            } else if (text === "สวัสดี") {
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