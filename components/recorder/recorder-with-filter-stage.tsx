"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as visionTasks from "@mediapipe/tasks-vision";
import Wrapper from "./ui/wrapper";
import TopBarWithCancelButton from "./ui/top-bar-with-cancel-button";
import CancelButton from "./ui/cancel-button";
import { useUser } from "@/context/user";
import RecordingTIme from "./ui/recording-time";
import VideoContainer from "./ui/video-container";
import CountdownOverlay from "./ui/count-down-overlay";
import REcordingIndicatorRing from "./ui/recording-indicator-ring";
import BottomControlBar from "./ui/bottom-control-bar";
import { useCamera } from "@/context/use-camera";

// Use the types directly from the namespace
type FaceDetector = visionTasks.FaceDetector;
type FilesetResolver = visionTasks.FilesetResolver;

interface CameraViewProps {
  onRecordComplete: any;
  setCameraError: any;
  cameraError: any;
}

function CameraScreen({ onRecordComplete }: CameraViewProps) {
  const { cancel } = useUser();
  const { stream, setStream } = useCamera();

  const [cameraLoading, setcameraLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState(false);

  const [isCountingDown, setIsCountingDown] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);

  const detectionResultsRef = useRef<any | null>(null);

  const filterImgRef = useRef<HTMLImageElement>(new Image());

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emptyDiv = useRef<HTMLDivElement>(null);

  // recording stuff
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const logoImgRef = useRef<HTMLImageElement>(new Image());

  // 1. Start Camera (unchanged)
  useEffect(() => {
    if (!stream) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 }, // request HD
            height: { ideal: 720 },
            facingMode: "user", // front camera on mobile
          },
          audio: true,
        })
        .then((s) => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        });
    } else if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // 2. Load MediaPipe Face Detector (The fix is applied here)
  useEffect(() => {
    const loadFaceDetector = async () => {
      try {
        setModelsLoading(true);
        console.log("Loading MediaPipe Face Detector model...");

        // Use the FilesetResolver from the namespace
        const vision = await visionTasks.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Use the FaceDetector from the namespace
        const detector = await visionTasks.FaceDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            },
            // FIX 2: Access RunningMode directly from the imported namespace
            runningMode: "VIDEO",
          }
        );

        setFaceDetector(detector);
        setModelsLoading(false);
        console.log("MediaPipe Face Detector loaded.");
      } catch (error) {
        console.error("Failed to load MediaPipe Face Detector:", error);
        alert("Failed to load Face Detection models.");
      }
    };

    loadFaceDetector();

    return () => {
      faceDetector?.close();
    };
  }, []);

  useEffect(() => {
    filterImgRef.current.src = "/mic.png"; // path in public folder
    filterImgRef.current.onload = () => {
      console.log("Filter image loaded");
    };
  }, []);

  useEffect(() => {
    logoImgRef.current.src = "/camera_top_logo.png"; // must be in /public
    logoImgRef.current.onload = () => {
      console.log("Logo image loaded");
    };
  }, []);

  // 3. Draw loop using requestAnimationFrame (unchanged logic)
  useEffect(() => {
    let animationFrameId: number;

    const drawLoop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const empDiv = emptyDiv.current;
      const ctx = canvas?.getContext("2d");

      if (
        !video ||
        !canvas ||
        !ctx ||
        !faceDetector ||
        video.readyState < 2 ||
        !empDiv
      ) {
        animationFrameId = requestAnimationFrame(drawLoop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detectionResult = faceDetector.detectForVideo(
        video,
        performance.now()
      );
      // // 1. Clear canvas and draw the video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const rect = empDiv.getBoundingClientRect(); // visible CSS size
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const rectW = rect.width;
      const rectH = rect.height;
      // 1. Calculate the scale factor that object-cover is using
      // It's the maximum of the horizontal and vertical scale ratios
      const scale = Math.max(rectW / canvasW, rectH / canvasH);

      // 2. Calculate the total size of the video frame *after* scaling to 'cover'
      const scaledW = canvasW * scale;
      const scaledH = canvasH * scale;

      // 3. Calculate the offsets (the cropped area) in CSS pixels
      const offsetX = (scaledW - rectW) / 2;
      const offsetY = (scaledH - rectH) / 2;

      // 4. Convert the CSS pixel offset back to Canvas pixel coordinates (divide by scale)
      const canvasOffsetX = offsetX / scale;
      const canvasOffsetY = offsetY / scale;

      const logoImg = logoImgRef.current;
      if (logoImg && logoImg.complete) {
        const DESIRED_PERCENTAGE = 0.5; // e.g., 15% of visible container width
        const VISIBLE_PADDING = 20; // 20px padding from the visible edge

        // Logo width is 15% of the visible container width, converted to canvas pixels
        const visibleLogoWidth = rectW * DESIRED_PERCENTAGE;
        const logoWidth = visibleLogoWidth / scale;

        const aspectRatio = logoImg.height / logoImg.width;
        const logoHeight = logoWidth * aspectRatio;

        // Calculate draw positions in CANVAS PIXELS:

        // X position: The total canvas width MINUS the cropped right-side offset
        // MINUS the logo width MINUS the visible padding (converted to canvas pixels)
        const drawX =
          canvasW - canvasOffsetX - logoWidth - VISIBLE_PADDING / scale;

        // Y position: The top offset (due to cropping) PLUS the visible padding
        const drawY = canvasOffsetY + VISIBLE_PADDING / scale;

        // 🖌️ Draw crisp logo (now correctly positioned in the visible area's top-right)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(logoImg, drawX, drawY, logoWidth, logoHeight);
      }

      // 2. Draw the detection results (Bounding Box)
      const filterImage = filterImgRef.current;
      // console.log(detectionResult);
      if (detectionResult && detectionResult.detections.length > 0) {
        for (const detection of detectionResult.detections) {
          const bbox = detection.boundingBox;
          //@ts-ignore
          let x = bbox.originX;
          //@ts-ignore
          const y = bbox.originY;
          //@ts-ignore
          const width = bbox.width;
          //@ts-ignore
          const height = bbox.height;

          // Adjust X for the mirrored canvas flip
          const mirroredX = canvas.width - x - width;

          if (filterImage && filterImage.complete) {
            const filterWidth = width * 0.6;
            // Calculate height to maintain aspect ratio
            const aspectRatio = filterImage.height / filterImage.width;
            const filterHeight = filterWidth * aspectRatio;
            const drawX = mirroredX + width / 2 - filterWidth / 2;
            const drawY = y + height * 1.6 - filterHeight / 2;

            ctx.drawImage(filterImage, drawX, drawY, filterWidth, filterHeight);
          }
        }
      }
      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [faceDetector]);

  // Start countdown before recording
  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        setIsCountingDown(false);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
        startRecordingWithCountdown();
      }
    }, 1000);
  };

  const startRecordingWithCountdown = async () => {
    if (!canvasRef.current) return;

    // Capture canvas stream (includes video + filter overlay)
    const stream = canvasRef.current.captureStream(30); // 30 FPS

    // Add audio from video
    const audioTracks = (
      videoRef.current?.srcObject as MediaStream
    )?.getAudioTracks();
    if (audioTracks?.length) stream.addTrack(audioTracks[0]);

    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      onRecordComplete(blob);
      recordedChunksRef.current = [];
      setIsRecording(false);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= 60) stopRecording();
        return newTime;
      });
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleCancel = () => {
    // Stop recording if in progress
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Stop countdown if in progress
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    cancel();
  };

  const overallLoading = cameraLoading || modelsLoading;

  return (
    <Wrapper>
      {/* Top Bar with Cancel Button */}
      <TopBarWithCancelButton>
        <CancelButton
          handleCancel={handleCancel}
          isCountingDown={isCountingDown}
        />
        {/* Recording Timer */}
        {isRecording && <RecordingTIme recordingTime={recordingTime} />}
      </TopBarWithCancelButton>
      <VideoContainer>
        <div
          ref={emptyDiv}
          className="w-full h-full absolute top-0 left-0"
        ></div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover absolute top-0 left-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Countdown Overlay */}
        {countdown !== null && <CountdownOverlay countdown={countdown} />}

        {/* Recording Indicator Ring */}
        {isRecording && <REcordingIndicatorRing />}
      </VideoContainer>

      <BottomControlBar
        isRecording={isRecording}
        isCountingDown={isCountingDown}
        startCountdown={startCountdown}
        stopRecording={stopRecording}
      />
    </Wrapper>
  );
}

export default CameraScreen;
