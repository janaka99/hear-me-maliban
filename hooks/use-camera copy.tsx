"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { videoStorage } from "@/lib/video-storage";

export interface CameraHook {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mediaRecorderRef: React.RefObject<MediaRecorder | null>;
  stream: MediaStream | null;
  isRecording: boolean;
  recordedVideoId: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
  error: string | null;
  // exposed for debugging if needed
  recordingStream?: MediaStream | null;
}

export function useCamera(): CameraHook {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const currentVideoIdRef = useRef<string | null>(null);
  const chunkIndexRef = useRef<number>(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoId, setRecordedVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // cloned stream used only for recording
  const recordingStreamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      setStream(mediaStream);

      // create a clone of tracks exclusively for recording
      const videoTracks = mediaStream.getVideoTracks();
      const audioTracks = mediaStream.getAudioTracks();

      const clonedVideoTrack = videoTracks.length
        ? videoTracks[0].clone()
        : null;
      const clonedAudioTrack = audioTracks.length
        ? audioTracks[0].clone()
        : null;

      const recTracks: MediaStreamTrack[] = [];
      if (clonedVideoTrack) recTracks.push(clonedVideoTrack);
      if (clonedAudioTrack) recTracks.push(clonedAudioTrack);

      recordingStreamRef.current = new MediaStream(recTracks);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // muted for preview since the recording stream has audio
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    // stop original stream
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    // stop recording cloned tracks if exist
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((t) => t.stop());
      recordingStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const startRecording = useCallback(async () => {
    // must use cloned recordingStream (separate tracks)
    const recordingStream = recordingStreamRef.current;
    if (!recordingStream) {
      setError("No recording stream available.");
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      const videoId = `video_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      currentVideoIdRef.current = videoId;
      chunkIndexRef.current = 0;

      console.log("[v0] Starting recording with video ID:", videoId);

      // choose mimeType that's supported
      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // let browser pick default
          }
        }
      }

      const mediaRecorder = new MediaRecorder(
        mimeType ? recordingStream : recordingStream,
        mimeType ? { mimeType } : undefined
      );

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          console.log(
            "[v0] Saving chunk",
            chunkIndexRef.current,
            "size:",
            event.data.size
          );
          chunksRef.current.push(event.data);

          try {
            // keep saving remote/local as you did
            await videoStorage.saveChunk(
              currentVideoIdRef.current!,
              chunkIndexRef.current,
              event.data,
              "video/webm"
            );
            chunkIndexRef.current++;
          } catch (err) {
            console.error("[v0] Error saving chunk:", err);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("[v0] Recording stopped, saving metadata");
        try {
          await videoStorage.saveMetadata({
            id: currentVideoIdRef.current!,
            totalChunks: chunkIndexRef.current,
            mimeType: mimeType || "video/webm",
            duration: 30,
            createdAt: Date.now(),
          });

          setRecordedVideoId(currentVideoIdRef.current);
          setIsRecording(false);
          console.log(
            "[v0] Video saved successfully with ID:",
            currentVideoIdRef.current
          );
        } catch (err) {
          console.error("[v0] Error saving video metadata:", err);
          setError("Failed to save video");
        }
      };

      // start with 1s timeslice (you were using 1000ms)
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("[v0] Stopping recording");
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setRecordedVideoId(null);
    currentVideoIdRef.current = null;
    chunksRef.current = [];
  }, []);

  return {
    videoRef,
    canvasRef,
    mediaRecorderRef,
    stream,
    isRecording,
    recordedVideoId,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    clearRecording,
    error,
    recordingStream: recordingStreamRef.current ?? null,
  };
}
