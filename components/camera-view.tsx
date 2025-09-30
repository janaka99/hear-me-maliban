"use client";
import React, { useEffect } from "react";
import WelcomeForm from "./welcome-form";
import { useUser } from "@/context/user";
import { Card } from "./ui/card";
import { LoaderCircle } from "lucide-react";
import VideoUploadForm from "./video-upload-form";
import { useRouter } from "next/navigation";

function CameraView({ view }: { view: "newspaper" | "app" }) {
  const { isloading, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (view !== "newspaper" && user) {
      router.push("/record");
    }
  }, [view, user, router]);

  if (isloading) {
    return (
      <div>
        <LoaderCircle className="text-xl size-9 text-accent animate-spin" />
      </div>
    );
  }

  if (view === "newspaper") {
    return (
      <div className="flex justify-center items-center p-6 h-full">
        <div className="flex flex-col justify-center items-center gap-10 w-full">
          <div className="max-w-72 md:max-w-96">
            <img src="/logo.png" alt="" />
          </div>
          <Card className="p-4 w-full max-w-sm flex justify-center items-center bg-gradient-to-br from-white/40 to-transparent">
            <VideoUploadForm />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100svh] mx-auto">
      <div className="flex justify-center items-center p-6 h-full">
        <div className="flex flex-col justify-center items-center gap-10 w-full">
          <div className="max-w-72 md:max-w-96">
            <img src="/logo.png" alt="" />
          </div>
          <Card className="p-4 w-full max-w-sm flex justify-center items-center bg-gradient-to-br from-white/40 to-transparent">
            <WelcomeForm />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CameraView;
