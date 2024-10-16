// scanner video feed
// see https://github.com/zxing-js/library

import React from 'react'
import './styles.scss'
import { BrowserBarcodeReader } from '@zxing/library'

const timeout = 1000 // time between frames
const scale = 0.5 // size of crop frame

let barcodeReader
let videoStream

// user clicked on the camera button - bring up scanner window.
export async function openScanner(onFoundBarcode) {

  barcodeReader = new BrowserBarcodeReader()

  showScanner()

  // get html elements
  const video = document.querySelector('#scanner-video video')
  const canvas = document.querySelector('#scanner-canvas')
  const img = document.querySelector('#scanner-image')
  const frame = document.querySelector('#scanner-frame')

  // turn on the video stream
  const constraints = { video: true }
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    videoStream = stream

    // handle play callback
    video.addEventListener('play', () => {
      // get video's intrinsic width and height, eg 640x480,
      // and set canvas to it to match.
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // set position of orange frame in video
      frame.style.width = video.clientWidth * scale + 'px'
      frame.style.height = video.clientHeight * scale + 'px'
      frame.style.left =
        (window.innerWidth - video.clientWidth * scale) / 2 + 'px'
      frame.style.top =
        (window.innerHeight - video.clientHeight * scale) / 2 + 'px'

      // start the barcode reader process
      scanFrame()
    })

    video.srcObject = stream
  })

  function scanFrame() {
    if (videoStream) {
      // copy the video stream image onto the canvas
      canvas.getContext('2d').drawImage(
        video,
        // source x, y, w, h:
        (video.videoWidth - video.videoWidth * scale) / 2,
        (video.videoHeight - video.videoHeight * scale) / 2,
        video.videoWidth * scale,
        video.videoHeight * scale,
        // dest x, y, w, h:
        0,
        0,
        canvas.width,
        canvas.height
      )
      // convert the canvas image to an image blob and stick it in an image element
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        // when the image is loaded, feed it to the barcode reader
        img.onload = async () => {
          barcodeReader
            // .decodeFromImage(img) // decodes but doesn't show img
            .decodeFromImage(null, url)
            .then(found) // calls onFoundBarcode with the barcode string
            .catch(notfound)
            .finally(releaseMemory)
          img.onload = null
          setTimeout(scanFrame, timeout) // repeat
        }
        img.src = url // load the image blob
      })
    }
  }

  function found(result) {
    onFoundBarcode(result.text)
    closeScanner()
  }

  function notfound(err) {
    if (err.name !== 'NotFoundException') {
      console.error(err)
    }
  }

  function releaseMemory() {
    URL.revokeObjectURL(img.url) // release image blob memory
    img.url = null
  }
}

export function closeScanner() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop()) // stop webcam feed
    videoStream = null
  }
  hideScanner()
  barcodeReader.reset()
}

function showScanner() {
  document.querySelector('.scanner').classList.add('visible')
}

function hideScanner() {
  document.querySelector('.scanner').classList.remove('visible')
}

export default function DataMatrixScanner() {
  return (
    <div className="scanner">
      <div id="scanner-video">
        <video autoPlay playsInline></video>
      </div>
      <div id="scanner-frame"></div>
      <canvas id="scanner-canvas"></canvas>
      <img id="scanner-image" src="" alt="" />
      <button id="scanner-close" onClick={closeScanner}>
        Close
      </button>
    </div>
  )
}