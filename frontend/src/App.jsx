import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Level from "./pages/Level";
import Statistics from "./pages/Statistics";
import About from "./pages/About";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/level/:id" element={<Level />} />
      <Route path="/stats" element={<Statistics />} /> 
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;