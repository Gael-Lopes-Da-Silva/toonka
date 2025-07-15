import { Outlet } from "react-router-dom";

import { Toast } from "../../components";

export default function Layout() {
	return (
		<>
			<Toast>
				<Outlet />
			</Toast>
		</>
	);
}
