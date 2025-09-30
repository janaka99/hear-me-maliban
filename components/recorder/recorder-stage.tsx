"use client";
import React, { useEffect, useRef, useState } from "react";
import RecordingStage from "./recording-stage";
import ProcessingStage from "./ProcessingStage";
import ResultStage from "./ResultStage";
import { useUser } from "@/context/user";
import RecordingStageWithFilter from "./recorder-with-filter-stage";

function RecorderStage({ mode }: { mode: "newspaper" | "app" }) {
  const { cancel } = useUser();
  const [stage, setStage] = useState<"recording" | "processing" | "result">(
    "recording"
  );
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  const onRecordComplete = async (videoBlob: Blob) => {
    setStage("processing");
    const formData = new FormData();
    console.log(videoBlob);
    formData.append("file", videoBlob);
    formData.append("upload_preset", "mallibal_u");

    const controller = new AbortController();
    uploadControllerRef.current = controller;
    console.log(videoBlob);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData, signal: controller.signal }
      );
      console.log(res);
      const data = await res.json();
      if (data.secure_url) {
        setRecordedVideo(data.secure_url);
        setStage("result");
      }

      console.log(data.secure_url);
      return data.secure_url;
    } catch (err) {
      console.log("Upload cancelled or failed", err);
      setStage("result");
      return "";
    }
  };

  const retry = () => {
    setCameraError(null);
    setRecordedVideo(null);
    setStage("recording");
  };

  return (
    <>
      {stage == "recording" && (
        <div className="w-full min-h-[100svh] flex flex-col">
          <div className="max-w-2xl mx-auto flex-grow h-[calc(100svh-80px)] flex justify-center items-center p-4 overscroll-y-auto min-w-sm">
            <div className="w-full max-w-[calc(100svh*9/16)] max-h-full  box-border rounded-2xl overflow-hidden">
              <RecordingStageWithFilter
                onRecordComplete={onRecordComplete}
                setCameraError={setCameraError}
                cameraError={cameraError}
              />
            </div>
          </div>
        </div>
      )}
      {stage == "processing" && <ProcessingStage />}
      {stage == "result" && recordedVideo && (
        <ResultStage recordedVideo={recordedVideo} retry={retry} />
      )}
    </>
  );
}

export default RecorderStage;

// <RecordingStage
//   onRecordComplete={onRecordComplete}
//   setCameraError={setCameraError}
//   cameraError={cameraError}
// />
