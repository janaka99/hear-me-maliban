"use client";
import { useUser } from "@/context/user";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { uploadVideo } from "@/actions/server";
import { CheckCircle2, XCircle, RotateCcw, Upload, Play } from "lucide-react";
import { Card } from "../ui/card";

interface ResultStageProps {
  recordedVideo: string;
  retry: () => void;
}

function ResultStage({ recordedVideo, retry }: ResultStageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const { user, cancel } = useUser();

  const upload = async () => {
    setUploading(true);
    setUploadError(false);
    setUploadSuccess(false);
    const res = await uploadVideo(user, recordedVideo);
    console.log(res);
    if (res.success) {
      setUploadSuccess(true);
    } else {
      setUploadError(true);
    }
    setUploading(false);
  };

  const handleRetry = () => {
    setUploadSuccess(false);
    setUploadError(false);
    retry();
  };

  return (
    <div className="w-full  min-h-[100svh] p-5 flex flex-col">
      {uploadSuccess ? (
        <div className="w-full flex-grow flex h-full justify-center items-center ">
          <Card className="p-6 flex flex-col justify-center items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-bold ">Upload Successful!</h2>
            <p className="/80 text-center max-w-md">
              Your video has been uploaded successfully. Thank you for your
              submission!
            </p>
            <div className="w-full space-y-4">
              <Button onClick={cancel} className="w-full bg-accent">
                Exit
              </Button>
              <Button
                onClick={handleRetry}
                disabled={uploading}
                className="w-full bg-accent"
              >
                Try again
              </Button>
            </div>
          </Card>
        </div>
      ) : uploadError ? (
        <div className="w-full flex-grow flex h-full justify-center items-center ">
          <Card className="p-6 flex flex-col justify-center items-center">
            <XCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold ">Upload Failed</h2>
            <p className="/80 text-center max-w-md">
              There was an error uploading your video. Please try again.
            </p>
            <div className="w-full space-y-4">
              <Button onClick={cancel} className="w-full bg-accent">
                Exit
              </Button>
              <Button
                onClick={handleRetry}
                disabled={uploading}
                className="w-full bg-accent"
              >
                Record Again
              </Button>
              <Button onClick={upload} disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Submit Video again
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center">
          <Card className="p-6 ">
            <div className=" text-center">Submit the video Here</div>
            <div className="px-4 max-h-[80vh] flex justify-center items-center">
              <div className="w-full h-full max-h-full max-w-fit aspect-[9/16] rounded-xl overflow-hidden">
                <div className="max-w-[calc(80vh*9/16)] max-h-full w-full aspect-[9/16] rounded-xl overflow-hidden">
                  <video
                    src={recordedVideo}
                    controls
                    className="w-full h-full object-cover rounded-xl overflow-hidden"
                    playsInline
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={upload}
              disabled={uploading}
              className="w-full rounded-full bg-accent hover:bg-accent/90 py-4 text-white font-semibold  h-auto shadow-xl border border-white/20  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Video
                </>
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ResultStage;
