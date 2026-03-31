import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react"; 
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewUser from "./pages/NewUser";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-user" element={<NewUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;