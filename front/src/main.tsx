import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { routes } from "./config/react-router";
import "./index.css";
import type { AppRoute } from "./config/react-router";
import './i18n'; 
const GOOGLE_CLIENT_ID =
  "709964897187-an6sclll2kfpfm4c3umc3bu4cnv0up4r.apps.googleusercontent.com";

const renderRoutes = (allRoutes: AppRoute[]) => {
  return allRoutes.map((route, index) => {
    const { children, element, ...routeProps } = route;
    return (
      <Route
        key={routeProps.path || index}
        path={routeProps.path}
        element={element}
      >
        {children ? renderRoutes(children) : null}
      </Route>
    );
  });
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>{renderRoutes(routes)}</Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
