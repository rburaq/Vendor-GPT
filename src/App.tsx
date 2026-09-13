import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { QueryModalProvider } from "./context/QueryModalContext";
import LoadingScreen from "./components/ui/LoadingScreen";
import CustomCursor from "./components/ui/CustomCursor";

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <QueryModalProvider>
      <CustomCursor />
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <RouterProvider router={router} />
    </QueryModalProvider>
  );
}
