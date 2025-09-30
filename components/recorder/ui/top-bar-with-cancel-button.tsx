import React from "react";

function TopBarWithCancelButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
      {children}
    </div>
  );
}

export default TopBarWithCancelButton;
