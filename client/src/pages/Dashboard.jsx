import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Dashboard.css";

import API from "../api/axios";

export default function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [listings, setListings] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [deletingId, setDeletingId] = useState(null);

    const [listingToDelete, setListingToDelete] = useState(null);


    // =========================================
    // FETCH DASHBOARD DATA
    // =========================================

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const [userResponse, listingsResponse] =
                    await Promise.all([

                        API.get("/users/me"),

                        API.get("/items/my-items")

                    ]);


                setUser(
                    userResponse.data.user ||
                    userResponse.data
                );


                setListings(
                    listingsResponse.data.items || []
                );

            }

            catch (err) {

                console.error(
                    "Failed to load dashboard:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard."
                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchDashboard();

    }, []);


    // =========================================
    // OPEN DELETE CONFIRMATION
    // =========================================

    const openDeleteConfirmation = (listing) => {

        setListingToDelete(listing);

    };


    // =========================================
    // CLOSE DELETE CONFIRMATION
    // =========================================

    const closeDeleteConfirmation = () => {

        if (deletingId) {
            return;
        }

        setListingToDelete(null);

    };


    // =========================================
    // DELETE LISTING
    // =========================================

    const handleDelete = async () => {

        if (!listingToDelete) {

            return;

        }


        const listingId = listingToDelete._id;


        try {

            setDeletingId(listingId);


            await API.delete(
                `/items/${listingId}`
            );


            // Remove deleted listing immediately

            setListings((previousListings) =>
                previousListings.filter(
                    (listing) =>
                        listing._id !== listingId
                )
            );


            // Close modal

            setListingToDelete(null);

        }

        catch (err) {

            console.error(
                "Failed to delete listing:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete listing."
            );

        }

        finally {

            setDeletingId(null);

        }

    };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <section className="dashboard-section">

                <div className="container text-center">

                    <h4>
                        Loading dashboard...
                    </h4>

                </div>

            </section>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <section className="dashboard-section">

                <div className="container">

                    <div className="alert alert-danger">

                        {error}

                    </div>

                </div>

            </section>

        );

    }


    // =========================================
    // DASHBOARD STATS
    // =========================================

    const stats = [

        {
            icon: "📦",
            title: "My Listings",
            value: listings.length,
            text: "Active items"
        },

        {
            icon: "🔄",
            title: "Exchange Requests",
            value: 0,
            text: "Pending requests"
        },

        {
            icon: "✨",
            title: "Suggestions",
            value: 0,
            text: "Possible swaps"
        },

        {
            icon: "⭐",
            title: "Trust Score",
            value: user?.averageRating || 0,
            text: "Average rating"
        }

    ];


    return (

        <section className="dashboard-section">

            <div className="container">


                {/* =================================
                    HEADER
                ================================= */}

                <div className="dashboard-header">

                    <h1>

                        Welcome back{" "}

                        {user?.fullName
                            ? user.fullName.split(" ")[0]
                            : ""}

                        {" "}👋

                    </h1>


                    <p>

                        Manage your listings, exchanges,
                        and account activity.

                    </p>

                </div>


                {/* =================================
                    STATS
                ================================= */}

                <div className="row g-4">

                    {stats.map((stat, index) => (

                        <div
                            className="col-lg-3 col-md-6"
                            key={index}
                        >

                            <div className="stat-card">

                                <div className="stat-icon">

                                    {stat.icon}

                                </div>


                                <h3>

                                    {stat.value}

                                </h3>


                                <h5>

                                    {stat.title}

                                </h5>


                                <p>

                                    {stat.text}

                                </p>

                            </div>

                        </div>

                    ))}

                </div>


                {/* =================================
                    QUICK ACTIONS
                ================================= */}

                <div className="dashboard-actions">

                    <h3>
                        Quick Actions
                    </h3>


                    <div className="action-buttons">

                        <Link
                            to="/create-listing"
                            className="btn btn-success"
                        >

                            ➕ Create Listing

                        </Link>


                        <Link
                            to="/suggestions"
                            className="btn btn-outline-success"
                        >

                            🔍 Find Exchanges

                        </Link>


                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                alert(
                                    "Exchange requests will be available once the exchange request system is implemented."
                                );
                            }}
                        >

                            📋 View Requests

                        </button>

                    </div>

                </div>


                {/* =================================
                    MY LISTINGS
                ================================= */}

                <div className="activity-section">

                    <h3>
                        My Listings
                    </h3>


                    <div className="activity-box">

                        {listings.length === 0 ? (

                            <div className="text-center p-4">

                                <p>

                                    You haven't created
                                    any listings yet.

                                </p>


                                <Link
                                    to="/create-listing"
                                    className="btn btn-success"
                                >

                                    Create Your First Listing

                                </Link>

                            </div>

                        ) : (

                            listings.map((listing) => (

                                <div
                                    className="activity-item"
                                    key={listing._id}
                                >

                                    <span className="activity-icon">

                                        {listing.images &&
                                        listing.images.length > 0

                                            ? "🖼️"

                                            : "📦"}

                                    </span>


                                    <div>

                                        <p>
                                            {listing.title}
                                        </p>


                                        <small>

                                            {listing.categoryId?.name ||
                                                "Category"}

                                            {" • "}

                                            {listing.subcategory}

                                            {" • "}

                                            {listing.condition}

                                        </small>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="d-flex gap-2 ms-auto">

                                        {/* VIEW */}

                                        <Link
                                            to={`/item/${listing._id}`}
                                            className="btn btn-sm btn-outline-success"
                                        >

                                            View

                                        </Link>


                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            className="btn btn-sm listing-edit-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/create-listing/${listing._id}`
                                                )
                                            }
                                        >

                                            Edit

                                        </button>


                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            className="btn btn-sm listing-delete-btn"
                                            onClick={() =>
                                                openDeleteConfirmation(
                                                    listing
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                listing._id
                                            }
                                        >

                                            Delete

                                        </button>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>


            </div>


            {/* =========================================
                DELETE CONFIRMATION MODAL
            ========================================= */}

            {listingToDelete && (

                <div
                    className="delete-modal-backdrop"
                    onClick={closeDeleteConfirmation}
                >

                    <div
                        className="delete-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="delete-modal-icon">
                            🗑️
                        </div>


                        <h3>
                            Delete Listing?
                        </h3>


                        <p>

                            Are you sure you want to delete{" "}

                            <strong>
                                {listingToDelete.title}
                            </strong>

                            ?

                        </p>


                        <small>

                            This listing will no longer appear
                            in your active listings.

                        </small>


                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={closeDeleteConfirmation}
                                disabled={Boolean(deletingId)}
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={Boolean(deletingId)}
                            >

                                {deletingId
                                    ? "Deleting..."
                                    : "Delete Listing"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>

    );

}
