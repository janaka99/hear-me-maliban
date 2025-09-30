import { useUser } from "@/context/user";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { uploadVideo } from "@/actions/server";

function ResultStage({ recordedVideo }: { recordedVideo: string }) {
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

  return (
    <div>
      <div className="w-full max-w-sm aspect-[9/16] bg-blacks relative">
        {uploadSuccess ? (
          <div className="">Successfully Submitted</div>
        ) : uploadError ? (
          <div className="">Failed to submit try again</div>
        ) : (
          <>
            <video
              src={recordedVideo}
              controls
              className="w-full h-full object-cover"
            />

            <Button disabled={uploading} onClick={upload}>
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default ResultStage;
