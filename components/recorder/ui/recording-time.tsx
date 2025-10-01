import React from "react";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

function RecordingTIme({ recordingTime }: { recordingTime: number }) {
  return (
    <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full border border-red-300/30">
      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
      <span className="text-white font-semibold text-sm">
        {formatTime(recordingTime)} / {formatTime(60)}
      </span>
    </div>
  );
}

export default RecordingTIme;
