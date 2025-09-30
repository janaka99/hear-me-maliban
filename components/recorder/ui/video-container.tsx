import React from "react";

function VideoContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
        {children}
      </div>
    </div>
  );
}

export default VideoContainer;
