import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";

function CancelButton({
  handleCancel,
  isCountingDown,
}: {
  handleCancel: () => void;
  isCountingDown: boolean;
}) {
  return (
    <Button
      onClick={handleCancel}
      variant="ghost"
      size="icon"
      className="rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/20 w-12 h-12"
      disabled={isCountingDown}
    >
      <X className="h-6 w-6" />
    </Button>
  );
}

export default CancelButton;
