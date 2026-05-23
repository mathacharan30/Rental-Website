import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IKContext } from "imagekitio-react";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient();

// Chrome prerenders pages from Google search/GSC in the background.
// If API calls fail during prerender, invalidate everything the moment
// the page activates so all components refetch with a live connection.
if (typeof document !== "undefined" && document.prerendering) {
  document.addEventListener(
    "prerenderingchange",
    () => queryClient.invalidateQueries(),
    { once: true }
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IKContext urlEndpoint="https://ik.imagekit.io/kayivtq3l">
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    </IKContext>
  </StrictMode>,
);
