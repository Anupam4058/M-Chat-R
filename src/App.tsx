/**
 * Main App Component
 * This is the root component of the application that sets up routing and global UI elements
 */
import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Result from "./pages/Result";

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
          {/* Results page showing questionnaire outcomes */}
          <Route path="/result" element={<Result />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
