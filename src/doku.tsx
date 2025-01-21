import { createRoot } from "react-dom/client";
import Doku from "./pages/Doku";
createRoot(
	document.getElementById("app")!
)
.render(<Doku/>)