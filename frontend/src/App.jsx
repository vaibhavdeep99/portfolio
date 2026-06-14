import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortfolioView from './components/PortfolioView';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
      } else {
        console.error('Failed to fetch portfolio data.');
      }
    } catch (err) {
      console.error('Network error fetching portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleUpdateData = (newData) => {
    setPortfolioData(newData);
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <Routes>
          <Route 
            path="/" 
            element={<PortfolioView data={portfolioData} loading={loading} />} 
          />
          <Route 
            path="/admin" 
            element={
              <AdminDashboard 
                portfolioData={portfolioData} 
                onUpdateData={handleUpdateData} 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
