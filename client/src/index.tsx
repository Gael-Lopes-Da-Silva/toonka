import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Error from "./pages/+error";
import Home from "./pages/home/+page";
import HomeLayout from "./pages/home/+layout";
import Dashboard from "./pages/home/dashboard/+page";
import DashboardLayout from "./pages/home/dashboard/+layout";

import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomeLayout />}>
					<Route index element={<Home />} />
					<Route path="dashboard" element={<DashboardLayout />}>
						<Route index element={<Dashboard />} />
					</Route>
					<Route path="*" element={<Error />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
