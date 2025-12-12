import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import RecallRoster from "./pages/RecallRoster";
import Manning from "./pages/Manning";
import { ScheduleProvider } from "./context/ScheduleContext";

function App() {
  return (
    <ScheduleProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/recall-roster" element={<RecallRoster />} />
            <Route path="/manning" element={<Manning />} />
          </Routes>
        </Layout>
      </Router>
    </ScheduleProvider>
  );
}

export default App;
