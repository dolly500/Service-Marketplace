import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import LandingPage from "../src/Landing/Landingpage";
import Home from "./Pages/Home/Home";
import Footer from "./Components/Footer/Footer";
import AuthPage from "./Pages/Auth/AuthPage";
import Profile from "./Pages/Profile/Profile";
import Services from "./Pages/Services/Services";
import Category from "./Pages/Category/Category";
import CategoryServices from "./Components/CategoryService/CategoryService";
import SearchResults from "./Pages/SearchResults/SearchResults";
import ProviderLogin from "./ServiceProviders/ProviderLogin/ProviderLogin";
import ProtectedRoute from "../src/Components/ProtectedRoutes/ProtectedRoute";
import ProviderLayout from "../src/ServiceProviders/ProviderLayout";

const App = () => {
  const location = useLocation();

  // Only treat /provider/* as dashboard routes
  const isProviderDashboard = 
    location.pathname.startsWith("/provider") && 
    location.pathname !== "/providerlogin";

  if (isProviderDashboard) {
    return (
      <div className="app">
        <Routes>
          <Route
            path="/provider/*"
            element={
              <ProtectedRoute requiredRole="serviceProvider">
                <ProviderLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    );
  }

  // Normal routes with Navbar + Footer
  return (
    <div className="app">
      <div style={{ padding: "0px 5px" }}>
        <Navbar />
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/searchservices" element={<SearchResults />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/category/:categoryName" element={<CategoryServices />} />
        <Route path="/providerlogin" element={<ProviderLogin />} /> 
      </Routes>

      <Footer />
    </div>
  );
};


export default App;
