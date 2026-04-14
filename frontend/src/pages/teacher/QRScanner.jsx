import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api"; // <-- Using the centralized axios instance

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

export default function StudentQRScanner() {
  const studentId = localStorage.getItem("id");
  const navigate = useNavigate();

  // State Management
  const [status, setStatus] = useState("Initializing Secure Scanner..."); 
  const [statusType, setStatusType] = useState("loading"); // loading, scanning, processing, success, error
  const [locationStr, setLocationStr] = useState("Acquiring GPS Lock...");
  const [gpsCoords, setGpsCoords] = useState(null);
  
  const scannerInstance = useRef(null);

  /* ===============================
        GEOFENCING / GPS LOGIC
  =============================== */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStr("GPS Not Supported by Browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStr(`Verified: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setStatusType("scanning");
        setStatus("Awaiting Live QR Code");
      },
      (err) => {
        console.error("GPS Error:", err);
        setLocationStr("Geofencing Failed - Location Required");
        setStatusType("error");
        setStatus("Please enable location services to mark attendance.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  /* ===============================
        QR SCANNER INITIALIZATION
  =============================== */
  useEffect(() => {
    // Only start scanner if we are actively in 'scanning' state (after GPS lock)
    if (statusType !== "scanning") return;

    const html5QrCode = new Html5Qrcode("university-qr-reader");
    scannerInstance.current = html5QrCode;

    const config = {
      fps: 15,
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
    };

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            // 1. Immediately pause scanning to prevent multiple API calls
            if (html5QrCode.isScanning) {
              await html5QrCode.stop();
            }

            setStatusType("processing");
            setStatus("Verifying Cryptographic Token...");

            // 2. Send token AND location to the backend
            try {
              // Centralized api instance automatically handles base URL and token headers
              const res = await api.post("/api/qr/scan", {
                studentId: studentId,
                token: decodedText,
                location: gpsCoords // Sends exact coordinates for Geofence validation
              });

              setStatusType("success");
              setStatus(res.data?.message || "Attendance Validated Successfully! 🎉");

              // Return to dashboard after 2 seconds
              setTimeout(() => navigate("/student/dashboard"), 2000);
            } catch (err) {
              const message = err.response?.data?.message || "Invalid or Expired Token";
              setStatusType("error");
              setStatus(message);

              // Allow user to try scanning again after 3 seconds
              setTimeout(() => {
                setStatusType("scanning");
                setStatus("Awaiting Live QR Code");
              }, 3000);
            }
          }
        );
      } catch (err) {
        console.error("Camera start failed", err);
        setStatusType("error");
        setStatus("Camera access denied or unavailable.");
      }
    };

    startScanner();

    // Cleanup function to stop camera when leaving the page
    return () => {
      if (scannerInstance.current && scannerInstance.current.isScanning) {
        scannerInstance.current.stop().catch(() => {});
      }
    };
  }, [statusType, gpsCoords, navigate, studentId]);

  /* ===============================
        UI RENDERING HELPERS
  =============================== */
  const getStatusColors = () => {
    switch (statusType) {
      case "success": return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "error": return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "processing": return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default: return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/student/dashboard" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2">
            <Icons.ArrowLeft /> Cancel Scan
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live View</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-md">
          
          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Secure Check-In</h1>
            <p className="text-slate-400 text-sm">Align the dynamic course QR code within the frame.</p>
          </div>

          {/* GPS Geofence Status */}
          <div className="flex items-center justify-center gap-2 mb-4 bg-slate-900 border border-slate-800 py-2 px-4 rounded-full w-max mx-auto shadow-lg">
            <Icons.MapPin />
            <span className={`text-xs font-bold font-mono ${gpsCoords ? 'text-emerald-400' : 'text-amber-400'}`}>
              {locationStr}
            </span>
          </div>

          {/* Scanner HUD Wrapper */}
          <div className="relative bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl shadow-indigo-900/20">
            
            {/* Corner Targeting Brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl z-10"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl z-10"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl z-10"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-xl z-10"></div>

            {/* The Actual Camera Feed */}
            <div className="rounded-2xl overflow-hidden bg-black relative aspect-square flex items-center justify-center">
              
              {/* Wait for GPS before showing camera */}
              {statusType === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Awaiting Satellites</p>
                </div>
              )}

              <div id="university-qr-reader" className="w-full h-full object-cover"></div>
              
              {/* Scanning Overlay Effect */}
              {statusType === "scanning" && (
                <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none z-20">
                  <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Status Feedback */}
          <div className={`mt-6 p-4 rounded-2xl border flex items-center justify-center gap-3 transition-colors duration-300 ${getStatusColors()}`}>
            {statusType === "success" ? <Icons.ShieldCheck /> : statusType === "error" ? <Icons.Alert /> : <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
            <span className="font-bold text-sm">{status}</span>
          </div>

        </div>
      </div>

      {/* Global Animation Keyframes for the scanner line */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(280px); opacity: 0; }
        }
        /* Hide the ugly default HTML5-QR-Code buttons and borders */
        #university-qr-reader { border: none !important; }
        #university-qr-reader img { display: none !important; }
        #university-qr-reader__dashboard_section_csr span { color: white !important; }
      `}} />
    </div>
  );
}