import React from "react";
import Header from "./components/Header";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-stone-200">
        <Header />
        <div className="flex">
          <Navigation />
          <main className="flex-1">
            <Routes>
              {/* <Route path="/" element={<Navigate to="/sales" replace />} />
              <Route path="/sales" element={<SalesTerminal />} />
              <Route path="/transfers" element={<InventoryTransfers />} />
              {user.role === "admin" && (
                <Route path="/admin" element={<Admin />} />
              )}
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/sales" replace />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
