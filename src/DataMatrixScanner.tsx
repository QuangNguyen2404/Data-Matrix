import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';

const DataMatrixScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const hints = new Map();
    // Focus only on Data Matrix codes
    hints.set(BarcodeFormat.DATA_MATRIX, true);  // Specify Data Matrix format
    const codeReader = new BrowserMultiFormatReader(hints); // Pass the hints here
    codeReaderRef.current = codeReader;
    let active = true;

    const startScanner = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0]?.deviceId;

        if (!selectedDeviceId) {
          setError('No camera device found.');
          return;
        }

        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              setResult(result.getText());
            }
            if (error) {
              console.error(error);
              setError(error.message);
            }
          }
        );
      } catch (err) {
        console.error(err);
        setError('Error accessing camera.');
      }
    };

    if (active) {
      startScanner();
    }

    return () => {
      active = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = (videoRef.current.srcObject as MediaStream);
        stream.getTracks().forEach(track => track.stop()); // Stop the camera
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', maxHeight: '50vh' }} />
      {result && (
        <div>
          <h3>Scanned Result:</h3>
          <p>{result}</p>
        </div>
      )}
      {error && (
        <div>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DataMatrixScanner;
