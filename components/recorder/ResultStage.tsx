"use client";
import { useUser } from "@/context/user";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { uploadVideo } from "@/actions/server";
import { CheckCircle2, XCircle, RotateCcw, Upload, Play } from "lucide-react";

interface ResultStageProps {
  recordedVideo: string;
  retry: () => void;
}

function ResultStage({ recordedVideo, retry }: ResultStageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const { user } = useUser();

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
    <div className="w-full min-w-[90%]  mx-auto py-6">
      <div className=" flex items-center justify-center w-full">
        <div className="w-full max-w-md space-y-6">
          {/* Video Container */}
          <div className="relative aspect-[9/16] rounded-3xl  border-2 border-white/10">
            {uploadSuccess ? (
              <div className="absolute  rounded-2xl inset-0 bg-gradient-to-br from-green-500/30 via-emerald-500/30 to-teal-500/30 backdrop-blur-xl flex flex-col items-center justify-center p-8">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6 border border-white/20 shadow-xl">
                  <CheckCircle2 className="w-20 h-20 text-green-400 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Success!</h2>
                <p className="text-white/80 text-center text-lg">
                  Your video has been submitted successfully
                </p>
              </div>
            ) : uploadError ? (
              <div className="absolute rounded-2xl inset-0 bg-gradient-to-br from-red-500/20 via-rose-500/20 to-pink-500/20 backdrop-blur-xl flex flex-col items-center justify-center p-8">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6 border border-white/20 shadow-xl">
                  <XCircle className="w-20 h-20 text-red-400 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Upload Failed
                </h2>
                <p className="text-white/80 text-center text-lg mb-8">
                  Something went wrong. Please try again.
                </p>
                <Button
                  onClick={handleRetry}
                  className="rounded-full w-full bg-accent hover:bg-accent/80 text-white font-semibold px-8 py-6 h-auto border border-white/20 "
                >
                  Record Another
                </Button>
              </div>
            ) : (
              <>
                <video
                  src={recordedVideo}
                  controls
                  className="w-full h-full object-cover aspect-[9/16]"
                  playsInline
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          {!uploadSuccess && !uploadError && (
            <div className="space-y-4">
              {/* Preview Label */}
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm w-full">
                <Play className="w-4 h-4" />
                <span>Preview your recording</span>
              </div>

              {/* Submit Button */}
              <Button
                onClick={upload}
                disabled={uploading}
                className="w-full rounded-full bg-accent hover:bg-accent/90 text-white font-semibold py-7 h-auto shadow-xl border border-white/20  disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Retry Button */}
              <Button
                onClick={handleRetry}
                disabled={uploading}
                variant="outline"
                className="w-full rounded-full bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-white/40 font-semibold py-7 h-auto shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Record Again
              </Button>
            </div>
          )}

          {/* Success State - Additional Actions */}
          {uploadSuccess && (
            <div className="flex justify-center">
              <Button
                onClick={handleRetry}
                className="rounded-full w-full bg-accent hover:bg-accent/80 text-white font-semibold px-8 py-6 h-auto border border-white/20 "
              >
                Record Another
              </Button>
            </div>
          )}

          {uploadError && (
            <>
              <Button
                onClick={upload}
                disabled={uploading}
                className="w-full rounded-full bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 h-auto  border border-white/20 "
              >
                <Upload className="w-5 h-5 mr-2" />
                Reupload
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default ResultStage;
