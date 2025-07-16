import { Outlet } from "react-router-dom";

import { Toast } from "../../components/core";

export default function Layout() {
	return (
		<>
			<Toast>
				<Outlet />
			</Toast>
		</>
	);
}
