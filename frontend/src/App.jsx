import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import Footer from "./Components/Footer/Footer";
import AuthPage from "./Pages/Auth/AuthPage";
import Profile from "./Pages/Profile/Profile";
import Services from "./Pages/Services/Services";
import Category from "./Pages/Category/Category";

const App = () => {
  return (
    <div className="app">
      <div style={{ padding: '0 40px' }}>
        <Navbar />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/categories" element={<Category />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
