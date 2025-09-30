import { Button } from "@/components/ui/button";
import { Camera, StopCircle } from "lucide-react";
import React from "react";

function BottomControlBar({
  isRecording,
  isCountingDown,
  startCountdown,
  stopRecording,
}: {
  isRecording: boolean;
  isCountingDown: boolean;
  startCountdown: () => void;
  stopRecording: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-4">
      <div className="flex justify-center items-center gap-4">
        {!isRecording && !isCountingDown ? (
          <Button
            onClick={startCountdown}
            className="rounded-full w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-2xl border-4 border-white/30 transition-all duration-300 hover:scale-110"
          >
            <Camera className="h-8 w-8 text-white" />
          </Button>
        ) : isRecording ? (
          <Button
            onClick={stopRecording}
            className="rounded-full w-20 h-20 bg-white/20 backdrop-blur-md hover:bg-white/30 border-4 border-red-500 transition-all duration-300 hover:scale-110"
          >
            <StopCircle className="h-8 w-8 text-red-500" />
          </Button>
        ) : null}
      </div>

      {/* Instructions */}
      {!isRecording && !isCountingDown && (
        <p className="text-center text-white/80 text-sm mt-4 px-4">
          Tap to start recording (max 30 seconds)
        </p>
      )}
    </div>
  );
}

export default BottomControlBar;
