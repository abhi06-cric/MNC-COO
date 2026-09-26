import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import Meetings from "./pages/Meetings";
import Candidates from "./pages/Candidates";
import About from "./pages/About";

import "./styles.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/about" element={<About />} />
        <Route path="/meetings" element={<Meetings />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;