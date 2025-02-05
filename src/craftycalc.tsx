import { createRoot } from "react-dom/client";
import CraftyCalc from "./pages/CraftyCalc";
createRoot(
	document.getElementById("app")!
)
.render(<CraftyCalc/>);