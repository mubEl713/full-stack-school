"use client";

const PrintButton = () => (
  <div className="mt-6 flex justify-center print:hidden">
    <button
      onClick={() => window.print()}
      className="bg-blue-400 text-white px-4 py-2 rounded-md text-sm"
    >
      Print / Save as PDF
    </button>
  </div>
);

export default PrintButton;
