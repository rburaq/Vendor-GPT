import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/chat", Component: ChatPage },
  { path: "*", Component: Home },
]);
