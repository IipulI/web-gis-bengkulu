import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import GISUpload from "./pages/GisUpload";
import MapLayer from "./pages/MapLayer";
import ReportLaporan from "./pages/ReportLaporan";
import MapPage from "./pages/Map/MapPage";
import Infrastructure from "./pages/Infrastructure";
import PublicationRules from "./pages/PublicationRules";
import ManagementNews from "./pages/ManagementNews";
// import SliderManagement from "./pages/ManagementSlider";
import News from "./views/news/News";
import Services from "./views/layanan/Services";
import LayerDetailPage from "./pages/LayerDetailPage";
import FeatureEditPage from "./pages/feature/FeatureEditPage";
import Help from "./pages/help/Help";
import Settings from "./pages/settings/Settings";
import ProtectedRoute from "./routes/ProtectedRoutes";
import NotFound from "./components/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/map-layer" element={<MapLayer />} />
        <Route path="/dashboard/map-layer/:id" element={<LayerDetailPage />} />
        <Route
          path="/layers/:layerId/edit-feature/:featureId"
          element={<FeatureEditPage />}
        />
        <Route path="/dashboard/report" element={<ReportLaporan />} />
        <Route path="/dashboard/help" element={<Help />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/news" element={<News />} /> */}
      {/* <Route path="/services" element={<Services />} /> */}
      {/* <Route path="/gis-upload" element={<GISUpload />} /> */}

      <Route path="/map" element={<MapPage />} />
      <Route path="*" element={<NotFound />} />
      {/* <Route path="/dashboard/infrastructure" element={<Infrastructure />} /> */}
      {/* <Route path="/dashboard/public-rules" element={<PublicationRules />} /> */}
      {/* <Route path="/dashboard/news" element={<ManagementNews />} /> */}
      {/* <Route path="/dashboard/slider" element={<SliderManagement />} /> */}
    </Routes>
  );
}
