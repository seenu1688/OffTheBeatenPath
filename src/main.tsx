import ReactDOM from "react-dom/client";
import { APIProvider } from "@vis.gl/react-google-maps";

import App from "@/App.tsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
    <App />
  </APIProvider>
);
