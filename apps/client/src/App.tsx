import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import StreamPage from "./StreamPage";
import Auth from "./Auth";
import Dashboard from "./pages/Dashboard";
import Preview from "./pages/Preview";
import Upload from "./pages/Upload"; // ✅ Correct Upload component
import MainLayout from "./MainLayout";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes (without sidebar) */}
      <Route path="/" element={<Home />} />
      <Route path="/stream" element={<StreamPage />} />
      <Route path="/auth" element={<Auth />} />

      {/* Sidebar layout routes */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="preview/:fileId" element={<Preview />} />
        <Route path="files" element={<Dashboard />} />
        <Route path="favorites" element={<Dashboard />} />
        <Route path="analytics" element={<Dashboard />} />
        <Route path="storage" element={<Dashboard />} />
        <Route path="settings" element={<Dashboard />} />
        <Route path="profile" element={<Dashboard />} />
        <Route path="help" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
