import { LoaderCircle } from "lucide-react";
import React from "react";

function CameraLoading() {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center  bg-accent">
      <div className="text-5xl">
        <LoaderCircle className="text-xl size-9 text-white animate-spin" />
      </div>
    </div>
  );
}

export default CameraLoading;
