import React from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import MainPage from "./pages/MainPage";
import PasteView from "./pages/PasteView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    index: true,
  },
  {
    path: "/:hash",
    element: <PasteView />,
  },
]);
const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
export default App;
