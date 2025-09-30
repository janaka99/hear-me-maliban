import React from "react";

function CountdownOverlay({ countdown }: { countdown: number }) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="text-white text-9xl font-bold animate-ping">
        {countdown}
      </div>
    </div>
  );
}

export default CountdownOverlay;
