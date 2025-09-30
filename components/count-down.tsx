import React from "react";

function CountDown({ countDown }: { countDown: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-9xl">
      {countDown}
    </div>
  );
}

export default CountDown;
