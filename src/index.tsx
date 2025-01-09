import { createRoot } from "react-dom/client";
import Main from "./pages/Main";

const el = document.getElementById("app")!;
createRoot(el).render(<Main/>)