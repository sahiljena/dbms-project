import { useEffect, useState } from "react";
import Auth from "./Auth/Auth";
import Dashbaord from "./pages/dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const [token, setToken] = useState("");
  useEffect(() => {
    let tempToken = localStorage.getItem("token");
    if (tempToken) setToken(tempToken);
  }, [token]);

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };
  return (
    <>
      {token.length === 0 ? (
        <div className="bg-gray-900 text-white">
          <Auth setToken={setToken} />
        </div>
      ) : (
        <>
          <Dashbaord handleLogout={handleLogout} token={token} />
        </>
      )}
      <ToastContainer />
    </>
  );
}

export default App;
