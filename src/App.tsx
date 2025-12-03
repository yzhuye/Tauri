import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import LineDetail from './pages/LineDetail';
import './styles/index.css';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main className="content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/line/:id" element={<LineDetail />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
