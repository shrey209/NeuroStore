import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import StreamPage from "./StreamPage";

import Dashboard from "./pages/Dashboard";
import Preview from "./pages/Preview";
import Upload from "./pages/Upload";
import MainLayout from "./MainLayout";
import ProtectedRoute from "./ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/stream" element={<StreamPage />} />

      {/* Protected Routes under MainLayout */}
      <Route element={<ProtectedRoute />}>
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
      </Route>
    </Routes>
  );
};

export default App;
