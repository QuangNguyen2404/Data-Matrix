import React, { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import {BrowserDatamatrixCodeReader} from '@zxing/browser';

const DataMatrixScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserDatamatrixCodeReader | null>(null);

  useEffect(() => {
    const hints = new Map();
    const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX/*, ...*/];
    // Focus only on Data Matrix codes

    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    const codeReader = new BrowserDatamatrixCodeReader(hints); // Pass the hints here
    codeReaderRef.current = codeReader;
    let active = true;

    const startScanner = async () => {
      try {
        const videoInputDevices = await BrowserDatamatrixCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[1]?.deviceId;

        if (!selectedDeviceId) {
          setError('No camera device found.');
          return;
        }

        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              alert(result);
              setResult(result.getText());
            }
            if (error) {
              console.error(error);
              alert(error)
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
