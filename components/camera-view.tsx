"use client";
import React from "react";
import WelcomeForm from "./welcome-form";
import { useUser } from "@/context/user";
import { Card } from "./ui/card";
import { LoaderCircle } from "lucide-react";
import RecorderStage from "./recorder/recorder-stage";

function CameraView({ view }: { view: "newspaper" | "app" }) {
  const { isloading, user } = useUser();

  if (isloading) {
    return (
      <div>
        <LoaderCircle className="text-xl size-9 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100svh]  mx-auto">
      {user ? (
        <div className="w-full h-[100svh] flex flex-col">
          <div className="max-w-2xl mx-auto flex-grow h-[calc(100svh-80px)] flex justify-center items-center p-4 overscroll-y-auto min-w-sm">
            <div className="w-full max-w-[calc(100svh*9/16)] max-h-full  box-border rounded-2xl overflow-hidden">
              <RecorderStage mode={view} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center p-6 h-full  from">
          <div className="flex flex-col justify-center items-center gap-10 w-full">
            <div className="max-w-72 md:max-w-96">
              <img src="/logo.png" alt="" />
            </div>
            <Card className="p-4 w-full max-w-sm flex justify-center items-center bg-gradient-to-br from-white/40 to-transparent">
              <WelcomeForm />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraView;
