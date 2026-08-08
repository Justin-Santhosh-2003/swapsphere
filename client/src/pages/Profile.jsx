import { useEffect, useState } from "react";
import "./Profile.css";
import API from "../api/axios";

export default function Profile() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const res = await API.get("/users/me");

                setUser(res.data.user || res.data);

            }

            catch (err) {

                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load profile."
                );

            }

            finally {

                setLoading(false);

            }

        };

        fetchProfile();

    }, []);

    if (loading) {

        return (

            <section className="profile-section">

                <div className="container text-center">

                    <h4>
                        Loading profile...
                    </h4>

                </div>

            </section>

        );

    }

    if (error) {

        return (

            <section className="profile-section">

                <div className="container">

                    <div className="alert alert-danger">

                        {error}

                    </div>

                </div>

            </section>

        );

    }

    if (!user) {
        return null;
    }

    const joinedYear = user.createdAt
        ? new Date(user.createdAt).getFullYear()
        : "2026";

    return (

        <section className="profile-section">

            <div className="container">

                <div className="profile-card">

                    <div className="profile-image">

                        {user.profilePicture ? (

                            <img
                                src={user.profilePicture}
                                alt={user.fullName}
                            />

                        ) : (

                            "👤"

                        )}

                    </div>

                    <h1>
                        {user.fullName}
                    </h1>

                    <p className="joined">

                        Member since {joinedYear}

                    </p>

                    <p className="bio">

                        {user.bio || "No bio added yet."}

                    </p>

                    <div className="trust-cards">

                        <div>

                            ⭐

                            <strong>
                                {user.averageRating || 0}
                            </strong>

                            <span>
                                Rating
                            </span>

                        </div>

                        <div>

                            🔄

                            <strong>
                                {user.totalCompletedExchanges || 0}
                            </strong>

                            <span>
                                Exchanges
                            </span>

                        </div>

                        <div>

                            ✅

                            <strong>
                                {user.exchangeSuccessRate || 0}%
                            </strong>

                            <span>
                                Success Rate
                            </span>

                        </div>

                    </div>

                </div>

                <div className="profile-section-box">

                    <h3>
                        Reviews
                    </h3>

                    <div className="review-card">

                        <h5>
                            Reviews will appear here
                        </h5>

                        <p>
                            ⭐⭐⭐⭐⭐
                        </p>

                        <span>
                            Your completed exchange reviews will be displayed here.
                        </span>

                    </div>

                </div>

                <div className="profile-section-box">

                    <h3>
                        Exchange History
                    </h3>

                    <div className="history-card">

                        <span>
                            Exchange history will appear here
                        </span>

                    </div>

                </div>

            </div>

        </section>

    );

}

