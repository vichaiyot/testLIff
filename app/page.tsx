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
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

      <div className="min-h-screen w-full bg-gradient-to-br from-green-50  to-emerald-50 flex items-center justify-center px-4 py-8 sm:px-6">
        {loading && !profile && (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
            <span className="text-sm">กำลังโหลด...</span>
          </div>
        )}

        {profile && (
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-lg shadow-green-100/50 p-6 sm:p-8 flex flex-col items-center gap-4 transition-all">
            {/* Avatar */}
            <div className="relative">
              {profile.pictureUrl ? (
                <img
                  src={profile.pictureUrl}
                  alt="profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-green-100"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-500 ring-4 ring-green-50">
                  {profile.displayName?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>

            {/* Name + UID */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {profile.displayName}
              </div>
              <div className="text-xs text-gray-400 mt-1 break-all">
                UID: {profile.userId}
              </div>
            </div>

            {/* Send message card */}
            <div className="w-full bg-gray-50 rounded-xl p-4 mt-2 flex flex-col gap-3 border border-gray-100">
              <div className="text-sm font-medium text-gray-700">
                ส่งข้อความหา User
              </div>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                placeholder="พิมพ์ข้อความ..."
              />
              <button
                onClick={sendMessage}
                disabled={sending}
                className="bg-green-500 hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white rounded-lg py-2.5 text-sm font-medium transition-all shadow-sm shadow-green-200"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    กำลังส่ง...
                  </span>
                ) : (
                  "ส่งข้อความ"
                )}
              </button>
            </div>

            <button
              onClick={logOut}
              className="text-sm text-red-400 hover:text-red-500 hover:underline mt-1 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </>
  );
}