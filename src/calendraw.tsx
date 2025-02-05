import { createRoot } from "react-dom/client";

import CalenDraw from "./pages/Calendraw";
createRoot(
	document.getElementById("app")!
)
.render(<CalenDraw/>);