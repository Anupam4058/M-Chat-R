/**
 * Main App Component
 * This is the root component of the application that sets up routing and global UI elements
 */
import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ChildInfo from "./pages/ChildInfo";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Result from "./pages/Result";
import Question1 from "./pages/Question1";
import Question2 from "./pages/Question2";
import Question3 from "./pages/Question3";
import Question4 from "./pages/Question4";
import Question5 from "./pages/Question5";
import Question6 from "./pages/Question6";
import Question7 from "./pages/Question7";
import Question8 from "./pages/Question8";
import Question9 from "./pages/Question9";
import Question10 from "./pages/Question10";
import Question11 from "./pages/Question11";
import Question12 from "./pages/Question12";
import Question13 from "./pages/Question13";
import Question14 from "./pages/Question14";
import Question15 from "./pages/Question15";
import Question16 from "./pages/Question16";
import Question17 from "./pages/Question17";
import Question18 from "./pages/Question18";
import Question19 from "./pages/Question19";
import Question20 from "./pages/Question20";

function App() {
  return (
    <div className="App">
      {/* Global Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
      
      {/* Application Router Setup */}
      <BrowserRouter>
        <Routes>
          {/* Redirect root to home page */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          {/* Main questionnaire page */}
          <Route path="/home" element={<Home />} />
          {/* Child information collection page */}
          <Route path="/child-info" element={<ChildInfo />} />
          {/* Individual question pages */}
          <Route path="/question/1" element={<Question1 />} />
          <Route path="/question/2" element={<Question2 />} />
          <Route path="/question/3" element={<Question3 />} />
          <Route path="/question/4" element={<Question4 />} />
          <Route path="/question/5" element={<Question5 />} />
          <Route path="/question/6" element={<Question6 />} />
          <Route path="/question/7" element={<Question7 />} />
          <Route path="/question/8" element={<Question8 />} />
          <Route path="/question/9" element={<Question9 />} />
          <Route path="/question/10" element={<Question10 />} />
          <Route path="/question/11" element={<Question11 />} />
          <Route path="/question/12" element={<Question12 />} />
          <Route path="/question/13" element={<Question13 />} />
          <Route path="/question/14" element={<Question14 />} />
          <Route path="/question/15" element={<Question15 />} />
          <Route path="/question/16" element={<Question16 />} />
          <Route path="/question/17" element={<Question17 />} />
          <Route path="/question/18" element={<Question18 />} />
          <Route path="/question/19" element={<Question19 />} />
          <Route path="/question/20" element={<Question20 />} />
          {/* Results page showing questionnaire outcomes */}
          <Route path="/result" element={<Result />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
