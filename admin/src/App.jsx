import Navbar from "./components/navbar/navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddCategory from "./Pages/AddCategory/Add";
import AddService from "./Pages/AddService/Service";
import GetCat from './Pages/GetCategory/getCategory'
import GetAllServices from './Pages/GetAllServices/GetAllservice'
import Approveservice from './Pages/ApproveService/Approveservice'
import Allproviders from './Pages/Allproviders/Allproviders'


const App = () => {
  const url = "http://localhost:4000";

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/addcategory" element={<AddCategory url={url} />} />
          <Route path="/addservice" element={<AddService url={url} />} />
          <Route path="/getcategory" element={<GetCat url={url} />} />
          <Route path="/getallservices" element={<GetAllServices url={url} />} />
          <Route path="/approveproviders" element={<Approveservice url={url} />} />
          <Route path="/allproviders" element={<Allproviders url={url} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
