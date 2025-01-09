import { createRoot } from "react-dom/client";
import Main from "./pages/Main";
createRoot(
	document.getElementById("app")!
)
.render(<Main/>)