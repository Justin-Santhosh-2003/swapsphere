import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../../api/axios";

import "./Navbar.css";


function Navbar() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [showMenu, setShowMenu] = useState(false);

    const profileRef = useRef(null);


    // =========================================
    // FETCH CURRENT USER
    // =========================================

    const fetchUser = async () => {

        const token = localStorage.getItem("token");

        if (!token) {

            setUser(null);

            return;

        }


        try {

            const res = await API.get("/users/me");

            setUser(
                res.data.user || res.data
            );

        }

        catch (error) {

            console.error(
                "Failed to fetch user:",
                error
            );

            setUser(null);

        }

    };


    // =========================================
    // INITIAL USER FETCH + AUTH CHANGE LISTENER
    // =========================================

    useEffect(() => {

        // Check login status when Navbar loads
        fetchUser();


        // Listen for register/login/logout
        const handleAuthChanged = () => {

            fetchUser();

        };


        window.addEventListener(
            "authChanged",
            handleAuthChanged
        );


        return () => {

            window.removeEventListener(
                "authChanged",
                handleAuthChanged
            );

        };

    }, []);


    // =========================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =========================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {

                setShowMenu(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

        setShowMenu(false);


        // Tell Navbar/authenticated components
        // that the authentication state changed

        window.dispatchEvent(
            new Event("authChanged")
        );


        navigate("/login");

    };


    // =========================================
    // USER INITIAL
    // =========================================

    const getUserInitial = () => {

        if (!user?.fullName) {

            return "U";

        }

        return user.fullName
            .charAt(0)
            .toUpperCase();

    };


    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">


                {/* =================================
                    LOGO
                ================================= */}

                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                >
                    SwapSphere
                </Link>


                {/* =================================
                    MOBILE HAMBURGER
                ================================= */}

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >

                    <span className="navbar-toggler-icon"></span>

                </button>


                {/* =================================
                    NAVIGATION
                ================================= */}

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >


                    {/* =================================
                        MAIN NAVIGATION LINKS
                    ================================= */}

                    <ul className="navbar-nav me-auto">


                        <li className="nav-item">

                            <Link
                                className="nav-link"
                                to="/"
                            >
                                Home
                            </Link>

                        </li>


                        <li className="nav-item">

                            <Link
                                className="nav-link"
                                to="/marketplace"
                            >
                                Marketplace
                            </Link>

                        </li>


                        {user && (

                            <li className="nav-item">

                                <Link
                                    className="nav-link"
                                    to="/dashboard"
                                >
                                    Dashboard
                                </Link>

                            </li>

                        )}

                    </ul>


                    {/* =================================
                        ACCOUNT AREA
                    ================================= */}

                    <div className="navbar-account">


                        {/* =================================
                            DESKTOP ACCOUNT
                        ================================= */}

                        {!user ? (

                            <div className="navbar-auth-buttons desktop-account">


                                <Link
                                    className="btn btn-outline-light me-2"
                                    to="/login"
                                >
                                    Login
                                </Link>


                                <Link
                                    className="btn btn-success"
                                    to="/register"
                                >
                                    Register
                                </Link>


                            </div>

                        ) : (

                            <div
                                className="profile-dropdown desktop-account"
                                ref={profileRef}
                            >


                                {/* PROFILE AVATAR */}

                                <button
                                    type="button"
                                    className="profile-avatar-button"
                                    onClick={() =>
                                        setShowMenu(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label="Open account menu"
                                >


                                    {user.profilePicture ? (

                                        <img
                                            src={user.profilePicture}
                                            alt={user.fullName}
                                            className="profile-avatar"
                                        />

                                    ) : (

                                        <span className="profile-avatar-placeholder">

                                            {getUserInitial()}

                                        </span>

                                    )}

                                </button>


                                {/* =================================
                                    DESKTOP DROPDOWN
                                ================================= */}

                                {showMenu && (

                                    <div className="profile-dropdown-menu">


                                        {/* USER INFORMATION */}

                                        <div className="profile-dropdown-header">


                                            <div className="profile-dropdown-avatar">


                                                {user.profilePicture ? (

                                                    <img
                                                        src={user.profilePicture}
                                                        alt={user.fullName}
                                                    />

                                                ) : (

                                                    <span>

                                                        {getUserInitial()}

                                                    </span>

                                                )}

                                            </div>


                                            <div className="profile-dropdown-user">


                                                <strong>

                                                    {user.fullName}

                                                </strong>


                                                <small>

                                                    {user.email}

                                                </small>


                                            </div>


                                        </div>


                                        <div className="profile-dropdown-divider"></div>


                                        {/* PROFILE */}

                                        <Link
                                            to="/profile"
                                            className="profile-dropdown-item"
                                            onClick={() =>
                                                setShowMenu(false)
                                            }
                                        >

                                            <span>
                                                👤
                                            </span>

                                            Profile

                                        </Link>


                                        {/* LOGOUT */}

                                        <button
                                            type="button"
                                            className="profile-dropdown-item logout-item"
                                            onClick={handleLogout}
                                        >

                                            <span>
                                                ↪
                                            </span>

                                            Logout

                                        </button>


                                    </div>

                                )}

                            </div>

                        )}


                        {/* =================================
                            MOBILE ACCOUNT
                        ================================= */}

                        {!user ? (

                            <div className="mobile-account">


                                {/* LOGIN */}

                                <Link
                                    className="mobile-login"
                                    to="/login"
                                >
                                    Login
                                </Link>


                                {/* REGISTER */}

                                <Link
                                    className="mobile-account-register"
                                    to="/register"
                                >
                                    Register
                                </Link>


                            </div>

                        ) : (

                            <div className="mobile-account">


                                {/* USER INFO */}

                                <div className="mobile-user-info">


                                    <div className="mobile-user-avatar">


                                        {user.profilePicture ? (

                                            <img
                                                src={user.profilePicture}
                                                alt={user.fullName}
                                            />

                                        ) : (

                                            <span>

                                                {getUserInitial()}

                                            </span>

                                        )}

                                    </div>


                                    <div>

                                        <strong>

                                            {user.fullName}

                                        </strong>


                                        <small>

                                            {user.email}

                                        </small>

                                    </div>


                                </div>


                                {/* PROFILE */}

                                <Link
                                    className="mobile-account-link"
                                    to="/profile"
                                >
                                    👤 Profile
                                </Link>


                                {/* LOGOUT */}

                                <button
                                    type="button"
                                    className="mobile-logout"
                                    onClick={handleLogout}
                                >
                                    ↪ Logout
                                </button>


                            </div>

                        )}

                    </div>

                </div>

            </div>

        </nav>

    );

}


export default Navbar;

