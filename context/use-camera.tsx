"use client";
// CameraContext.tsx
import { createContext, useContext, useState } from "react";

const CameraContext = createContext<{
  stream: MediaStream | null;
  setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
}>({
  stream: null,
  setStream: () => {},
});

export const CameraProvider = ({ children }: { children: React.ReactNode }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  return (
    <CameraContext.Provider value={{ stream, setStream }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => useContext(CameraContext);
