"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Camera, X, StopCircle } from "lucide-react";
import { useUser } from "@/context/user";
import Wrapper from "./ui/wrapper";
import TopBarWithCancelButton from "./ui/top-bar-with-cancel-button";
import CancelButton from "./ui/cancel-button";
import RecordingTIme from "./ui/recording-time";
import VideoContainer from "./ui/video-container";
import BottomControlBar from "./ui/bottom-control-bar";
import CountdownOverlay from "./ui/count-down-overlay";
import REcordingIndicatorRing from "./ui/recording-indicator-ring";

interface RecordingStageProps {
  onRecordComplete: (videoBlob: Blob) => void;
  setCameraError: any;
  cameraError: null | string;
}

function RecordingStage({
  onRecordComplete,
  setCameraError,
  cameraError,
}: RecordingStageProps) {
  const { cancel } = useUser();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError(
          "Could not access camera. Please ensure you've granted permission."
        );
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Draw video to canvas
  const drawToCanvas = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!ctx) return;

    ctx.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    animationRef.current = requestAnimationFrame(drawToCanvas);
  };

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
        startRecording();
      }
    }, 1000);
  };

  // Start recording
  const startRecording = () => {
    if (!canvasRef.current || !streamRef.current) return;

    drawToCanvas();

    const canvasStream = canvasRef.current.captureStream(30);

    // Add audio track from camera stream
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      chunksRef.current = [];
      onRecordComplete(blob);
    };

    mediaRecorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);

    // timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= 30) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
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

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    cancel();
  };

  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md text-center">
          <p className="text-white text-lg mb-4">{cameraError}</p>
          <Button
            onClick={handleCancel}
            className="rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Video Container */}
      <VideoContainer>
        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Canvas for Recording */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-0"
        />

        {/* Countdown Overlay */}
        {countdown !== null && <CountdownOverlay countdown={countdown} />}

        {/* Recording Indicator Ring */}
        {isRecording && <REcordingIndicatorRing />}
      </VideoContainer>

      {/* Bottom Control Bar */}
      <BottomControlBar
        isRecording={isRecording}
        isCountingDown={isCountingDown}
        startCountdown={startCountdown}
        stopRecording={stopRecording}
      />
    </Wrapper>
  );
}

export default RecordingStage;
