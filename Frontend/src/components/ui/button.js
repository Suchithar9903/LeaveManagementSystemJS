// src/components/ui/button.js or button.jsx
import React from "react";

export const Button = ({ children, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${props.className}`}
  >
    {children}
  </button>
);
