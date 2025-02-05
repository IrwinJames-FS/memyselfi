import { createRoot } from "react-dom/client";
import About from "./pages/About";

createRoot(
	document.getElementById("app")!
)
.render(<About/>);