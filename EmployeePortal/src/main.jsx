import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import EmployeeProvider from "./Context/EmlpoyeeContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <EmployeeProvider>
      <App />
    </EmployeeProvider>
  </BrowserRouter>
);
