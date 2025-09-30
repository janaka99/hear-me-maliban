"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, CheckCircle2, Film } from "lucide-react";

function ProcessingStage() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Uploading video", icon: Film },
    { label: "Processing content", icon: Loader2 },
    { label: "Analyzing data", icon: Sparkles },
    { label: "Finalizing", icon: CheckCircle2 },
  ];

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    // Update current step based on progress
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="inset-0 bg-gradient-to-br  overflow-hidden">
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Main Content Card */}
          <div className="bg-white/5s backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl bg-white-5 ">
            {/* Animated Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Rotating Ring */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-accent/30 animate-spin"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderTopColor: "oklch(60.35% 0.234 25.04)",
                  }}
                />

                {/* Center Icon */}
                <div
                  className="relative bg-gradient-to-br from-accent/20 to-purple-500/20 backdrop-blur-md rounded-full p-6 border border-white/20 shadow-xl flex items-center justify-center"
                  style={{ width: "120px", height: "120px" }}
                >
                  {React.createElement(steps[currentStep].icon, {
                    className: "w-12 h-12 text-accent animate-pulse",
                  })}
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-accent text-center mb-3">
              Processing Video
            </h2>
            <p className=" text-center text-base mb-8 text-accent text-gray-500">
              Please wait while we process your submission
            </p>

            {/* Progress Bar */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">{progress}%</span>
                <span className="text-gray-500">
                  {steps[currentStep].label}
                </span>
              </div>
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-300 ease-out shadow-lg "
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                      isCurrent
                        ? "bg-accent/10 border border-accent/30 scale-105"
                        : isCompleted
                        ? "bg-white/5 border border-white/10"
                        : "bg-white/5 border border-white/5 opacity-50"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 transition-all duration-500 ${
                        isCurrent
                          ? "bg-accent/20 border border-accent/40"
                          : isCompleted
                          ? "bg-green-500/20 border border-green-500/40"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${
                            isCurrent
                              ? "text-accent animate-pulse"
                              : "text-white/40"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`font-medium transition-all duration-500 ${
                        isCurrent
                          ? "text-white"
                          : isCompleted
                          ? "text-white/80"
                          : "text-white/40"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="text-center space-y-3">
            <p className="text-gray-500 text-sm">This may take a few moments</p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Do not close this window</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingStage;
