"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionHook {
  faces: FaceDetection[];
  isLoading: boolean;
  error: string | null;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
  isModelReady: boolean;
}

export function useFaceDetection(): FaceDetectionHook {
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const isModelReadyRef = useRef(false);

  // load model once
  useEffect(() => {
    let mounted = true;
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const tf = await import("@tensorflow/tfjs");
        await tf.ready();

        const blazeface = await import("@tensorflow-models/blazeface");
        const model = await blazeface.load();

        if (!mounted) return;
        modelRef.current = model;
        isModelReadyRef.current = true;
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading face detection model:", err);
        if (mounted) {
          setError("Failed to load face detection model");
          setIsLoading(false);
        }
      }
    };
    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  // create offscreen canvas
  useEffect(() => {
    offscreenCanvas.current = document.createElement("canvas");
    return () => {
      // drop reference so GC can collect
      offscreenCanvas.current = null;
    };
  }, []);

  const detectFaces = useCallback(async (video: HTMLVideoElement) => {
    if (!modelRef.current || !video.videoWidth || !video.videoHeight) return;

    try {
      const canvas = offscreenCanvas.current!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // copy video frame into offscreen canvas (synchronous)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // run detection on the canvas element (not the video element)
      const predictions = await modelRef.current.estimateFaces(canvas, false);

      const detectedFaces: FaceDetection[] = (predictions || []).map(
        (prediction: any) => ({
          x: prediction.topLeft[0],
          y: prediction.topLeft[1],
          width: prediction.bottomRight[0] - prediction.topLeft[0],
          height: prediction.bottomRight[1] - prediction.topLeft[1],
        })
      );

      setFaces(detectedFaces);
    } catch (err) {
      console.error("Error detecting faces:", err);
    }
  }, []);

  // start detection at ~10 FPS (throttled)
  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      if (!video) return;
      if (!isModelReadyRef.current) {
        console.warn("Model not ready yet. Waiting for model to load.");
        return;
      }
      // if already running, stop first
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // detect every 100ms (~10 fps)
      const id = window.setInterval(() => {
        detectFaces(video);
      }, 100);

      intervalRef.current = id;
    },
    [detectFaces]
  );

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFaces([]);
  }, []);

  return {
    faces,
    isLoading,
    error,
    startDetection,
    stopDetection,
    isModelReady: isModelReadyRef.current,
  };
}
