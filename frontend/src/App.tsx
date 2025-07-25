import React from "react";
import Header from "./components/Header";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { useAuthStore } from "./store/auth.store";
import Login from "./pages/Login";
import { Management } from "./pages/Managment";
import SalesTerminal from "./pages/SalesTerminal";
import Reports from "./pages/Reports";

const App = () => {
  const {user, isLoading, getProfile} = useAuthStore();
  React.useEffect(() => {
    if (!user) {
      getProfile();
    }
  }, [user, getProfile]);

  if(isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if(!user) {
    return <Login />;
  }
  return (
    <Router>
      <div className="min-h-screen bg-stone-200">
        <Header />
        <div className="flex">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/management" element={<Management />} />
              <Route path="/" element={<SalesTerminal />} />
              <Route path="/reports" element={<Reports />} />
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
