import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Result from "@/pages/Result";
import Admin from "@/pages/Admin";
import Hangzhou from "@/pages/Hangzhou";
import HangzhouResult from "@/pages/HangzhouResult";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/hangzhou" element={<Hangzhou />} />
        <Route path="/hangzhou-result" element={<HangzhouResult />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}