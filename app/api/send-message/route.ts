import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const LINE_API_URL = "https://api.line.me/v2/bot/message/push";

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
};

const sendMessage = async (userUid: string, message: string) => {
    const body = {
        to: userUid,
        messages: [
            {
                type: "text",
                text: message,
            },
        ],
    };
    const response = await axios.post(LINE_API_URL, body, { headers });
    return response;
};

export async function POST(req: NextRequest) {
    const { userUid, message } = await req.json();

    try {
        const response = await sendMessage(userUid, message);
        console.log("=== LINE log", response.data);
        return NextResponse.json({ message: "Message OK" });
    } catch (error: any) {
        console.log("error", error.response?.data);
        return NextResponse.json(
            { error: error.response?.data ?? "Unknown error" },
            { status: 400 }
        );
    }
}