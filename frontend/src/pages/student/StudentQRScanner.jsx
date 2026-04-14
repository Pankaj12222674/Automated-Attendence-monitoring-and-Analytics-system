import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../utils/api"; // Adjust the import path as needed

export default function StudentQRScanner() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "student-qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          // Token and Base URL are now handled automatically by the api instance
          await api.post("/api/qr/scan", { token: decodedText });

          setMessage("✅ Attendance Marked Successfully!");

          // Clear the scanner after a successful read
          setTimeout(() => {
            scanner.clear();
          }, 500);
        } catch (err) {
          setMessage("❌ Scan Failed or QR Expired");
        }
      },
      (error) => console.log("Scan Error:", error)
    );

    // Cleanup function
    return () => {
      try {
        scanner.clear();
      } catch (err) {
        console.error("Failed to clear scanner on unmount:", err);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-white to-[#e9d5ff] flex items-center justify-center p-6">
      <div
        className="relative max-w-xl w-full bg-white/40 backdrop-blur-xl 
        rounded-3xl shadow-2xl p-8 border border-white/20 
        transform transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
      >
        {/* Glow top */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-40 h-2 bg-purple-400 blur-2xl opacity-50"></div>

        <h1 className="text-3xl font-extrabold text-center 
        bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent 
        drop-shadow-md mb-6 animate-fade-in">
          Scan QR for Attendance
        </h1>

        {/* Scanner Box Container */}
        <div
          id="student-qr-reader"
          className="rounded-2xl overflow-hidden shadow-xl border border-purple-300 
          transform transition-all hover:scale-[1.02] animate-slide-up"
          style={{ width: "100%" }}
        ></div>

        {/* Message */}
        {message && (
          <p
            className={`mt-6 text-center text-lg font-semibold animate-fade-in 
            ${
              message.includes("Success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}