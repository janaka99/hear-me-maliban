import CameraView from "@/components/camera-view";
import React from "react";

async function page({ searchParams }: { searchParams: Promise<any> }) {
  const pr = await searchParams;
  let view = null;
  if (!pr.utm_medium) {
    view == "app";
  }
  view = pr.utm_medium;

  return <CameraView view={view} />;
}

export default page;
