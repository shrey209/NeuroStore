import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import StreamPage from "./StreamPage";

const App: React.FC = () => {
  return (
    <div className="p-4 font-mono">
      <nav className="mb-4 space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">🏠 Home</Link>
        <Link to="/stream" className="text-blue-600 hover:underline">📡 Stream</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stream" element={<StreamPage />} />
      </Routes>
    </div>
  );
};

export default App;
