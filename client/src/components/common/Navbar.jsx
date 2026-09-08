import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

import "./Navbar.css";


function Navbar() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications
    } = useNotifications();

    const [showMenu, setShowMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);

    const profileRef = useRef(null);
    const notifRef   = useRef(null);


    // =========================================
    // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    // =========================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }

            if (
                notifRef.current &&
                !notifRef.current.contains(event.target)
            ) {
                setShowNotif(false);
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
    // OPEN NOTIFICATION PANEL
    // =========================================

    const handleOpenNotif = () => {
        const next = !showNotif;
        setShowNotif(next);
        if (next) {
            fetchNotifications(1);
        }
    };


    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {

        setShowMenu(false);
        logout();
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

    // =========================================
    // NOTIFICATION TYPE ICON
    // =========================================

    const getNotifIcon = (type) => {
        const icons = {
            EXCHANGE_REQUEST:  "🔄",
            REQUEST_ACCEPTED:  "✅",
            REQUEST_REJECTED:  "❌",
            REQUEST_CANCELLED: "↩️",
            NEW_MESSAGE:       "💬",
            EXCHANGE_COMPLETED:"🎉",
            ACCOUNT_SUSPENDED: "⛔",
            ACCOUNT_ACTIVATED: "✅",
            ITEM_REMOVED:      "🗑️",
            GENERAL:           "📢"
        };
        return icons[type] || "🔔";
    };

    // =========================================
    // TIME AGO
    // =========================================

    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
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

                        {user?.role === "ADMIN" && (

                            <li className="nav-item">

                                <Link
                                    className="nav-link nav-link-admin"
                                    to="/admin"
                                >
                                    ⚙️ Admin
                                </Link>

                            </li>

                        )}

                    </ul>


                    {/* =================================
                        ACCOUNT AREA
                    ================================= */}

                    <div className="navbar-account">


                        {/* =================================
                            NOTIFICATION BELL (authenticated only)
                        ================================= */}

                        {user && (

                            <div
                                className="notif-wrapper"
                                ref={notifRef}
                            >

                                <button
                                    id="notif-bell-btn"
                                    type="button"
                                    className="notif-bell-btn"
                                    onClick={handleOpenNotif}
                                    aria-label="Notifications"
                                >
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="notif-badge">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* NOTIFICATION DROPDOWN */}

                                {showNotif && (

                                    <div className="notif-dropdown">

                                        <div className="notif-dropdown-header">

                                            <span className="notif-dropdown-title">
                                                🔔 Notifications
                                                {unreadCount > 0 && (
                                                    <span className="notif-header-badge">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </span>

                                            {unreadCount > 0 && (
                                                <button
                                                    className="notif-mark-all-btn"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all read
                                                </button>
                                            )}

                                        </div>

                                        <div className="notif-dropdown-list">

                                            {notifications.length === 0 ? (

                                                <div className="notif-empty">
                                                    <span>🔕</span>
                                                    <p>No notifications yet</p>
                                                </div>

                                            ) : (

                                                notifications.slice(0, 8).map((notif) => (

                                                    <div
                                                        key={notif._id}
                                                        className={`notif-item ${!notif.isRead ? "notif-item--unread" : ""}`}
                                                        onClick={() => {
                                                            if (!notif.isRead) markAsRead(notif._id);
                                                            if (notif.link) {
                                                                setShowNotif(false);
                                                                navigate(notif.link);
                                                            }
                                                        }}
                                                    >

                                                        <span className="notif-item-icon">
                                                            {getNotifIcon(notif.type)}
                                                        </span>

                                                        <div className="notif-item-body">
                                                            <p className="notif-item-msg">
                                                                {notif.message}
                                                            </p>
                                                            <span className="notif-item-time">
                                                                {timeAgo(notif.createdAt)}
                                                            </span>
                                                        </div>

                                                        {!notif.isRead && (
                                                            <span className="notif-dot" />
                                                        )}

                                                    </div>

                                                ))

                                            )}

                                        </div>

                                        <div className="notif-dropdown-footer">

                                            <Link
                                                to="/notifications"
                                                className="notif-view-all"
                                                onClick={() => setShowNotif(false)}
                                            >
                                                View all notifications →
                                            </Link>

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}


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

                                        {/* NOTIFICATIONS LINK */}

                                        <Link
                                            to="/notifications"
                                            className="profile-dropdown-item"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <span>🔔</span>
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="notif-badge-inline">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Link>

                                        {/* ADMIN PANEL LINK */}
                                        {user?.role === "ADMIN" && (
                                            <Link
                                                to="/admin"
                                                className="profile-dropdown-item admin-link"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <span>⚙️</span>
                                                Admin Panel
                                            </Link>
                                        )}


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

                                {/* NOTIFICATIONS */}

                                <Link
                                    className="mobile-account-link"
                                    to="/notifications"
                                >
                                    🔔 Notifications
                                    {unreadCount > 0 && (
                                        <span className="notif-badge-inline">
                                            {unreadCount}
                                        </span>
                                    )}
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

