"use client";

import { useState } from "react";
import Script from "next/script";
import axios from "axios";

declare global {
  interface Window {
    liff: any;
  }
}

interface Profile {
  pictureUrl?: string;
  displayName?: string;
  userId?: string;
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const initLiff = async () => {
    try {
      await window.liff.init({ liffId: "2011098983-WQYQCmoh" });
      if (window.liff.isLoggedIn()) {
        const p = await window.liff.getProfile();
        setProfile(p);
      } else {
        window.liff.login();
      }
    } catch (err) {
      console.error("LIFF init error", err);
    }
  };

  const logOut = () => {
    window.liff.logout();
    window.location.reload();
  };

  const sendMessage = async () => {
    if (!message) {
      alert("message not found");
      return;
    }
    if (!profile?.userId) return;

    setSending(true);
    try {
      const response = await axios.post("/api/send-message", {
        userUid: profile.userId,
        message,
      });
      console.log("response", response.data);
      setMessage("");
    } catch (error: any) {
      console.log("error", error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="afterInteractive"
        onLoad={initLiff}
      />

      {profile && (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-3">
          {profile.pictureUrl && (
            <img
              width={100}
              height={100}
              src={profile.pictureUrl}
              alt="profile"
              className="rounded-full w-24 h-24 object-cover"
            />
          )}
          <div>
            Hello <b>{profile.displayName}</b>
          </div>
          <div className="text-sm text-gray-500">UID {profile.userId}</div>

          <div className="w-full bg-gray-100 rounded-lg p-4 mt-2 flex flex-col gap-2">
            <div className="text-sm font-medium">Send message</div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="พิมพ์ข้อความ..."
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-md py-2 text-sm font-medium transition-colors"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          <button
            onClick={logOut}
            className="text-sm text-red-500 hover:underline mt-2"
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}