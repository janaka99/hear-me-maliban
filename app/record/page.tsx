"use client";

import RecorderStage from "@/components/recorder/recorder-stage";
import { useUser } from "@/context/user";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function page() {
  const { user, isloading } = useUser();
  const router = useRouter();
  if (isloading) {
    return (
      <div>
        <LoaderCircle className="text-xl size-9 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
  }

  return <RecorderStage mode="app" />;
}

export default page;
