import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Profile from "./pages/UserProfile.js";
import "../src/styles/app_style.css";
import LeaveStatus from "./pages/LeaveStatus.js";
import ApplyLeave from "./components/ApplyLeave.js";
import { useEffect, useRef, useState } from "react";
import AdminLogin from "./pages/AdminLogin.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import Notifications from "./components/Notifications.js";
import HomeBanner from "./components/HomeBanner.js";
import managerDashboard from "./pages/ManagerDashboard.js";
import { FaUser, FaBell, FaTimes, FaBars } from "react-icons/fa";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import API from "./axios.js";
import { jwtDecode } from "jwt-decode";
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState("");
    const [navOpen, setNavOpen] = useState(false);
    const [hasUnreadNotif, setHasUnreadNotif] = useState(false);
    const [userRole, setUserRole] = useState("");
    const navigate = useNavigate();
    const [navVisible, setNavVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if(currentScrollY < 10) {
                setNavVisible(true);
            }
            else if(currentScrollY < lastScrollY.current){
                setNavVisible(true);
            }else if(currentScrollY > lastScrollY.current){
                setNavVisible(false);
                if(navOpen){
                    setNavOpen(true)
                }
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll, {passive: true});
        return window.removeEventListener("scroll", handleScroll);
    },[navOpen]);
    useEffect(() => {
        const userToken = localStorage.getItem("token");
        const adminToken = localStorage.getItem("adminToken");

        if (userToken) {
            const decodedToken = jwtDecode(userToken);
            console.log('Decoded JWT:', decodedToken);
            const expiryTime = decodedToken.exp * 1000;
            const currentTime = Date.now();

            if(currentTime >= expiryTime){
                handleLogout();
            }else{
            setIsAuthenticated(true);
            setUserRole((decodedToken.user && decodedToken.user.role ? decodedToken.user.role : "").toLowerCase());
            fetchUserProfile(userToken);
            fetchNotifications(userToken);

            const timeout = setTimeout(handleLogout, expiryTime - currentTime);
            return() => clearTimeout(timeout);
            }
        }
        if (adminToken) {
            setIsAdmin(true);
        }
    }, [isAuthenticated, isAdmin]);

    const fetchUserProfile = async (token) => {
        try{
            const response = await API.get("/users/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if(response.status == 200){
                const userData = response.data;
                setUsername(userData.name);
            }
        }catch(error){
            console.error("error fetching user profile", error);
        }
    }

    const fetchNotifications = async (token) => {
        try{
            const response = await API.get("/notifications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if(response.status == 200){
                const notifications = response.data;
                const unreadNotifications = notifications.some(
                    (notification) => !notification.isRead
                );
                setHasUnreadNotif(unreadNotifications);
            }
        }catch(error){
            console.error("error fetching notifications", error);
        }
    }
    const handleLogin = () => {
        setIsAuthenticated(true);
    };
    const handleAdminLogin = () => {
        setIsAdmin(true);
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/");
    };

    const handleAdminLogout = () => {
        localStorage.removeItem("adminToken");
        setIsAdmin(false);
        navigate("/admin-login");
    };

    const toggleNav = () => {
        setNavOpen(!navOpen)
    }

    const closeNav = () => {
        setNavOpen(false);
    }
    const handleNotifications = () => {
        setHasUnreadNotif(false);
    }
    return (
        <>
        <ToastContainer position="top-right" autoClose={3000}/>
        <div className="container mt-3">
            <h1 className="display-4">{isAuthenticated && username ? 
                `Welcome back , ${username}` : 
                "Welcome to Leave Management System..."
            }</h1>
            {/* Removed debug Role display as requested */}
            <div className={`nav-wrapper ${navVisible ? 'visible' : 'hidden'}`}>
            <div className="hamburger-menu" onClick={toggleNav}>
                {navOpen ? <FaTimes /> : <FaBars />}
            </div>
            <div className={`navbar-container ${navOpen ? 'nav-open' : ''}`}>
                {!isAuthenticated && !isAdmin ? (
                    <>
                        <Link to="/" className="nav-link" onClick={closeNav}>Home</Link>
                        <Link to="/login" className="nav-link" onClick={closeNav}>Login</Link>
                        <Link to="/register" className="nav-link" onClick={closeNav}>Register</Link>
                        <Link to="/admin-login" className="nav-link" onClick={closeNav}>Admin</Link>
                    </>
                ) : isAuthenticated ? (
                    <>  
                        <Link to="/" className="nav-link" onClick={closeNav}>Home</Link>
                        {userRole === "employee" && (
                            <>
                                <Link to="/leave-status" className="nav-link" onClick={closeNav}>Leave Status</Link>
                                <Link to="/apply-leave" className="nav-link" onClick={closeNav}>Apply Leave</Link>
                            </>
                        )}
                        {userRole === "manager" && (
                            <>
                                <Link to="/leave-requests" className="nav-link" onClick={closeNav}>Leave Requests</Link>
                            </>
                        )}
                        <Link to="/profile" className="nav-link" onClick={closeNav}><FaUser className="nav-icon" /></Link>
                        <Link to="/notifications" className="nav-link" onClick={closeNav}>
                            <div style={{position: "relative"}}>
                                <FaBell className="nav-icon" />
                                {hasUnreadNotif && (
                                    <span
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "-5px",
                                        backgroundColor: "red",
                                        color: "white",
                                        borderRadius: "50%",
                                        padding: "2px 6px",
                                        fontSize: "12px",
                                    }}
                                >
                                    !
                                </span>
                                )}
                            </div>
                        </Link>
                        <button onClick={() => {handleLogout(); closeNav();}} className="nav-link logout">Logout</button>
                    </>
                ) : isAdmin ? (
                    <>
                        <Link to="/dashboard" className="nav-link" onClick={closeNav}>Admin Panel</Link>
                        <button onClick={() => {handleAdminLogout(); closeNav();}} className="nav-link logout">Logout</button>
                    </>
                ) : null}
                </div>
            </div>

            <Routes>
                <Route path="/" element={<HomeBanner />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/leave-status" element={<LeaveStatus />} />
                <Route path="/apply-leave" element={<ApplyLeave />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications onMarkAsRead={handleNotifications}/>} />
                <Route path="/admin-login" element={<AdminLogin onLogin={handleAdminLogin} />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
            </Routes>

            <center>
                <div className="footer">
                    <p>&copy; 2025 Leave Management System [All Rights Reserved]</p>
                </div>
            </center>
        </div>
        </>
    );
}

export default App;