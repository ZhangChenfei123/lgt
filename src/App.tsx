import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Result from "@/pages/Result";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}