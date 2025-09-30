"use client";

import {
  VideoUploadSchema,
  VideoUploadSchemaType,
  WelcomeFormSchema,
  type WelcomeFormSchemaType,
} from "@/schema/file-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  ChevronDownIcon,
  UploadIcon,
  VideoIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Calendar } from "./ui/calendar";
import { useUser } from "@/context/user";
import { Progress } from "./ui/progress";
import { videoUploadAction } from "@/actions/server";
import { toast } from "sonner";

function VideoUploadForm() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string>("");
  const [uploadComplete, setUploadComplete] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadControllerRef = React.useRef<AbortController | null>(null);
  const { isloading, setUser } = useUser();

  const form = useForm<VideoUploadSchemaType>({
    resolver: zodResolver(VideoUploadSchema),
    defaultValues: {
      name: "",
      phone: "",
      dob: "",
      video: "",
    },
  });

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(video.src);

      if (video.duration > 120) {
        alert("Video must be 2 minutes or less");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setVideoFile(file);

      try {
        const res = await uploadVideo(file);
        if (res) {
          setVideoUrl(res);
          form.setValue("video", res); // Update RHF
          setUploadComplete(true);
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Video upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    video.src = URL.createObjectURL(file);
  };

  const uploadVideo = async (videoBlob: Blob) => {
    return new Promise<string | null>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", videoBlob);
      formData.append("upload_preset", "mallibal_u");

      const xhr = new XMLHttpRequest();
      const controller = new AbortController();
      uploadControllerRef.current = controller;

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`
      );

      // ✅ Update progress while uploading to Cloudinary
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            resolve(data.secure_url); // return video URL
          } else {
            reject("No URL returned from Cloudinary");
          }
        } else {
          reject(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => reject("Upload failed due to network error");

      xhr.send(formData);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      handleVideoUpload(file);
    } else {
      alert("Please select a valid video file");
    }
  };

  const submit = async (values: WelcomeFormSchemaType) => {
    if (isUploading) {
      return;
    }
    const res = await videoUploadAction(values);
    if (res.success) {
      form.reset();
      setVideoFile(null);
      setVideoUrl("");
      setUploadProgress(0);
      setUploadComplete(false);
      toast.success("Upload Successful 🎉", {
        description: "Your event video has been uploaded successfully.",
        icon: <CheckCircle2 className="text-green-500" />,
      });
    } else {
      toast.error("Upload Failed", {
        description: "Something went wrong while uploading. Please try again.",
        icon: <XCircle className="text-red-500" />,
      });
    }
  };

  return (
    <div className="p-6 w-full">
      {/* Glassmorphism container */}
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-6 w-full relative z-10"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    disabled={form.formState.isSubmitting}
                    {...field}
                    className="bg-white/5 border-white/20 backdrop-blur-sm text-black placeholder:text-black/40 focus:bg-white/10 focus:border-white/40 transition-all duration-300 rounded-xl h-12"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="bg-white/5 border-white/20 backdrop-blur-sm text-black placeholder:text-black/40 focus:bg-white/10 focus:border-white/40 transition-all duration-300 rounded-xl h-12"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Date of Birth
                </FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal bg-white/5 border-white/20 backdrop-blur-sm text-gray-600  hover:bg-white/10 hover:border-white/40 transition-all duration-300 rounded-xl h-12"
                    >
                      {field.value
                        ? new Date(field.value).toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon className="text-gray-600 " />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      captionLayout="dropdown"
                      onSelect={(selectedDate) => {
                        if (!selectedDate) return;

                        // Convert Date to ISO string before updating RHF
                        const dateStr = selectedDate.toISOString();

                        setDate(selectedDate); // optional local state
                        field.onChange(dateStr); // update RHF value with string
                        setOpen(false);
                      }}
                      className="text-gray-600"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="video"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Video Upload
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      disabled={form.formState.isSubmitting}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!videoFile && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={form.formState.isSubmitting}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-white/5 border-white/20 backdrop-blur-sm text-gray-600 hover:bg-white/10 hover:border-white/40 transition-all duration-300 rounded-xl h-12"
                      >
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Choose Video
                      </Button>
                    )}

                    {videoFile && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/20 rounded-xl backdrop-blur-sm">
                          <VideoIcon className="h-5 w-5 text-purple-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {videoFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          {uploadComplete && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>

                        {isUploading && (
                          <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-center text-gray-600">
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        )}

                        {uploadComplete && !isUploading && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoUrl("");
                              setUploadProgress(0);
                              setUploadComplete(false);
                              form.setValue("video", "");
                            }}
                            className="w-full bg-white/5 border-white/20 backdrop-blur-sm text-gray-600 hover:bg-white/10 hover:border-white/40 transition-all duration-300 rounded-xl h-10 text-sm"
                          >
                            Change Video
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {uploadComplete && (
            <div className="w-full flex justify-center pt-2">
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white font-semibold h-12 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={form.formState.isSubmitting || isloading}
              >
                {form.formState.isSubmitting ? "Starting..." : "Start"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

export default VideoUploadForm;
