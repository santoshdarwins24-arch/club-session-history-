import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner({ handleQRScan }) {

  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef(null);
  const processingRef = useRef(false);


  /* ===============================
     STOP SCANNER SAFELY
  =============================== */

  const stopScanner = async () => {

    if (!scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    } catch (err) {
      console.log("Scanner stop error:", err);
    }

    setIsScanning(false);
    processingRef.current = false;
  };


  /* ===============================
     START SCANNING
  =============================== */

  const startScanning = async () => {

    const qrRegionId = "reader";

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrRegionId);
    }

    const scanner = scannerRef.current;

    try {

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        alert("No camera found");
        return;
      }

      const cameraId = cameras[0].id;

      setIsScanning(true);

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: 250
        },

        async (decodedText) => {

          if (processingRef.current) return;
          processingRef.current = true;

          try {

            const cleaned = decodedText.trim();
            const parts = cleaned.split("|");

            if (parts.length !== 2) {
              alert("Invalid QR format");
              await stopScanner();
              return;
            }

            const sessionId = parts[0].trim();
            const scannedToken = parts[1].trim().toLowerCase();

            const sessionRef = doc(db, "sessions", sessionId);
            const sessionSnap = await getDoc(sessionRef);

            if (!sessionSnap.exists()) {
              alert("Session does not exist");
              await stopScanner();
              return;
            }

            const sessionData = sessionSnap.data();

            if (
              !sessionData.token ||
              sessionData.token.trim().toLowerCase() !== scannedToken
            ) {
              alert("Invalid session token");
              await stopScanner();
              return;
            }

            const now = new Date();
            const start = sessionData.startTime?.toDate();
            const expiry = sessionData.expiryTime?.toDate();

            if (!start || !expiry) {
              alert("Session timing missing");
              await stopScanner();
              return;
            }

            if (now < start) {
              alert("Session has not started yet");
              await stopScanner();
              return;
            }

            if (now > expiry) {
              alert("Session expired");
              await stopScanner();
              return;
            }

            if (!sessionData.active) {
              alert("Session is not active");
              await stopScanner();
              return;
            }

            handleQRScan({
              id: sessionId,
              title: sessionData.title,
              points: sessionData.points
            });

            await stopScanner();

          } catch (err) {

            console.error("QR processing error:", err);
            alert("Error processing QR");
            await stopScanner();

          }

        }
      );

    } catch (err) {

      console.error("Scanner start error:", err);
      alert("Could not start scanner");

    }

  };


  return (
    <div className="qr-card">

      <h2 className="qr-title">QR Scanner</h2>

      <p className="qr-desc">
        Scan the session QR code to get the points
      </p>

      {!isScanning && (
        <button className="scan-btn" onClick={startScanning}>
          Start Scanning
        </button>
      )}

      {isScanning && (
        <button className="stop-btn" onClick={stopScanner}>
          Stop Scanner
        </button>
      )}

      <div id="reader" className="scanner-box" />

    </div>
  );
}

export default QRScanner;
