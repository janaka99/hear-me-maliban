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

  // recording stuff
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 1. Start Camera (unchanged)
  const startCamera = async () => {
    try {
      setcameraLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: 640,
          height: 480,
        },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadeddata = () => {
          setcameraLoading(false);
        };
      } else {
        setcameraLoading(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Could not access camera. Please ensure you have granted camera permissions."
      );
    }
  };

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

        startCamera();
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

  // 3. Draw loop using requestAnimationFrame (unchanged logic)
  useEffect(() => {
    let animationFrameId: number;
    const lastPos = { x: 0, y: 0, w: 0, h: 0 };
    let hasLast = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const drawLoop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!video || !canvas || !ctx || !faceDetector || video.readyState < 2) {
        animationFrameId = requestAnimationFrame(drawLoop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // // 1. Clear canvas and draw the video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const detectionResult = faceDetector.detectForVideo(
        video,
        performance.now()
      );

      // 2. Draw the detection results (Bounding Box)
      const filterImage = filterImgRef.current;
      console.log(detectionResult);
      if (detectionResult && detectionResult.detections.length > 0) {
        for (const detection of detectionResult.detections) {
          const bbox = detection.boundingBox;
          //@ts-ignore
          let x = bbox.originX;
          //@ts-ignore
          let y = bbox.originY;
          //@ts-ignore
          let w = bbox.width;
          //@ts-ignore
          let h = bbox.height;

          if (hasLast) {
            x = lerp(lastPos.x, x, 0.2);
            y = lerp(lastPos.y, y, 0.2);
            w = lerp(lastPos.w, w, 0.2);
            h = lerp(lastPos.h, h, 0.2);
          }

          lastPos.x = x;
          lastPos.y = y;
          lastPos.w = w;
          lastPos.h = h;
          hasLast = true;

          // Adjust X for the mirrored canvas flip
          const mirroredX = canvas.width - x - w;
          // const mirroredX = x;

          //   Draw the bounding box
          // ctx.strokeStyle = "lime";
          // ctx.lineWidth = 3;

          // 3. Draw the Filter Image on the Face
          if (filterImage && filterImage.complete) {
            console.log("looping ");
            // Determine the size of the filter.
            // We'll make it slightly wider than the face (e.g., 1.2 times the width)
            const filterWidth = w * 0.6;
            // Calculate height to maintain aspect ratio
            const aspectRatio = filterImage.height / filterImage.width;
            const filterHeight = filterWidth * aspectRatio;

            // Calculate center of the bounding box
            const centerX = mirroredX + w / 2;
            const centerY = y + h / 2;

            // Calculate the top-left corner to draw the image, centering it.
            // We can adjust the Y position to align with specific facial features (e.g., the mouth area for a mustache)
            // Since this is a microphone, let's place it a bit below the nose/mouth line (around 2/3 down the face)
            // const drawX = centerX - filterWidth / 2;
            // const drawY = y + height * 0.1 - filterHeight / 2; // 65% down the face
            const drawX = mirroredX + w / 2 - filterWidth / 2;
            const drawY = y + h * 1.6 - filterHeight / 2;

            // // Draw bounding box
            // ctx.strokeStyle = "lime"; // box color
            // ctx.lineWidth = 3; // thickness
            // ctx.strokeRect(x, y, width, height);

            ctx.drawImage(filterImage, drawX, drawY, filterWidth, filterHeight);
          }
        }
      }

      // 3. Example text/image
      // ctx.fillStyle = "white";
      // ctx.font = "20px Arial";
      // ctx.fillText(
      //   faceDetector ? "Face Detector Active" : "Waiting for Detector...",
      //   10,
      //   40
      // );

      //   ctx.drawImage(filterImgRef.current, 200, 200, 200, 200);

      // --- END DRAWING LOGIC ---

      animationFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [faceDetector]);

  // Start countdown before recording
  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    console.log("go here 1 ");
    let count = 3;
    countdownRef.current = setInterval(() => {
      console.log("go here 2");
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
        if (newTime >= 30) stopRecording();
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
