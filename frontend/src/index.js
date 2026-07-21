import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Remove the static SEO H1 (only needed for non-JS crawlers like Babylovegrowth)
// once React is ready to take over. Real users + Google with JS see only the React H1.
const staticH1 = document.getElementById("static-seo-h1");
if (staticH1) staticH1.remove();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <App />
);
