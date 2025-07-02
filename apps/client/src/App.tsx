import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import StreamPage from "./StreamPage";
import Auth from "./Auth"; // ✅ Import it
import Dashboard from "./pages/Dashboard";
import Preview from "./pages/Preview";

const App: React.FC = () => {
  return (
    <div className="p-4 font-mono">
      <nav className="mb-4 space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">🏠 Home</Link>
        <Link to="/stream" className="text-blue-600 hover:underline">📡 Stream</Link>
        <Link to="/auth" className="text-blue-600 hover:underline">🔐 Auth</Link> {/* ✅ New nav link */}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stream" element={<StreamPage />} />
        <Route path="/auth" element={<Auth />} /> {/* ✅ New route */}
         <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/preview/:fileId" element={<Preview />} />
          {/* Placeholder routes for sidebar navigation */}
          <Route path="/files" element={<Dashboard />} />
          <Route path="/upload" element={<Dashboard />} />
          <Route path="/favorites" element={<Dashboard />} />
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/storage" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/help" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
