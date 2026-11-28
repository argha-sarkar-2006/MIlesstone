import React from "react";
import ReactDOM from "react-dom/client";
import AdminApp from "./roles/admin/index";
import ClientApp from "./roles/client/index";
import FreelancerApp from "./roles/freelancer/index";
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/components.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const role = path === "/client" || path.startsWith("/client/")
  ? "client"
  : path === "/freelancer" || path.startsWith("/freelancer/")
    ? "freelancer"
    : "admin";
const DashboardApp = role === "client" ? ClientApp : role === "freelancer" ? FreelancerApp : AdminApp;
document.title = "MilestoneLock · " + (role === "admin" ? "Organization Admin" : role === "client" ? "Client" : "Freelancer");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><DashboardApp /></React.StrictMode>,
);
