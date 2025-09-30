"use client";

import { useCamera } from "@/hooks/use-camera";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { videoStorage } from "@/lib/video-storage";
import { Button } from "./ui/button";
import { ArrowLeft, LoaderCircle, Mic, Play, Square } from "lucide-react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useEffectEvent, useRef, useState } from "react";

interface CameraViewProps {
  mode: "filter" | "empty";
}

function CameraScreen({ mode }: CameraViewProps) {
  const [cameraLoading, setcameraLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  const lastNoseRef = useRef<{ x: number; y: number } | null>(null);

  const micImg = new Image();
  micImg.src = "/mic.png";

  const videoRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const micImgRef = useRef<HTMLImageElement | null>(null);

  //Load image
  const loadImage = async () => {
    setImageLoading(true);
    const res = new Promise<boolean>((resolve, reject) => {
      const micImg = new Image();
      micImg.src = "/mic.png";

      micImg.onload = () => {
        micImgRef.current = micImg;
        resolve(true);
      };

      micImg.onerror = (err) => {
        console.error("Failed to load mic image");
        reject(false);
      };
    });
    try {
      await res;
      setImageLoading(false);
    } catch (error) {}
  };

  // done
  const startCamera = async () => {
    try {
      setcameraLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setcameraLoading(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Could not access camera. Please ensure you have granted camera permissions."
      );
    }
  };

  //load models
  const loadModels = async () => {
    try {
      setModelsLoading(true);
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      startCamera();
      setModelsLoading(false);
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (mode == "filter") {
      loadModels();
      // loadImage();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const drawLoop = async () => {
      console.log("Loop runs");
      const video = videoRef.current;
      const canvas = canvasRef.current;
      //@ts-ignore
      const ctx = canvas?.getContext("2d");

      // Skip this frame if still processing or resources not ready
      if (!video || !canvas || !ctx || !micImg) {
        console.log("Loop stuck ", ctx);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.5,
      });
      console.log("video found ", video);
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      console.log("loop runs ", detections);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let nosePos: { x: number; y: number } | null = null;

      detections.forEach((det) => {
        const landmarks = det.landmarks;
        const nose = landmarks.getNose();
        if (nose.length > 0) {
          nosePos = { x: nose[0].x, y: nose[0].y };
          const [x, y] = [nose[0].x - 25, nose[0].y - 50]; // adjust for image size
          lastNoseRef.current = nosePos;
          // ctx.drawImage(micImg, x, y, 50, 50);
        }
      });

      // if (detections.length > 0) {
      //   const nose = detections[0].landmarks.getNose();
      //   if (nose.length > 0) {
      //     nosePos = { x: nose[0].x, y: nose[0].y };
      //     lastNoseRef.current = nosePos; // store last detected position
      //   }
      // }

      // Use last known position if current frame has no detection
      const pos = nosePos || lastNoseRef.current;
      if (pos) {
        console.log("Pos runnin ", lastNoseRef.current);
        console.log("ctx ", ctx);
        const fixedHeight = 200;
        const aspectRatio = micImg.naturalWidth / micImg.naturalHeight;
        const width = fixedHeight * aspectRatio;
        const scale = 1 + 0.05 * Math.sin(Date.now() / 200);
        const drawWidth = width * scale;
        const drawHeight = fixedHeight * scale;
        const [x, y] = [pos.x - drawWidth / 2, pos.y - drawHeight / 2];

        ctx.drawImage(micImg, x, y, drawWidth, drawHeight);
        ctx.drawImage(micImg, 20, 20, 150, 150);
        console.log("image osition ", { x, y, drawWidth, drawHeight });
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
      }
    };
    if (videoRef.current) {
      interval = setInterval(drawLoop, 100); // 10 FPS
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl ">
      <div className="absolute top-0 left-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      />
      {/* {cameraLoading || */}
      {/* (modelsLoading && ( */}
      <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center  bg-accent">
        <div className="text-5xl">
          <LoaderCircle className="text-xl size-9 text-white animate-spin" />
        </div>
      </div>
      {/* ))} */}
    </div>
  );
}

export default CameraScreen;
