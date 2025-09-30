import React from "react";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0  to-black overflow-hidden">{children}</div>
  );
}

export default Wrapper;
