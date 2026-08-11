import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "./Profile.css";

export default function Profile() {
    const { user, updateUser, fetchUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [editData, setEditData] = useState({
        fullName: "",
        phone: "",
        bio: "",
        location: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (user) {
            setEditData({
                fullName: user.fullName || "",
                phone: user.phone || "",
                bio: user.bio || "",
                location: user.location || ""
            });
            setPreviewUrl(user.profilePicture || "");
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();
            formData.append("fullName", editData.fullName);
            formData.append("phone", editData.phone);
            formData.append("bio", editData.bio);
            formData.append("location", editData.location);
            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }

            const res = await API.put("/users/me", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.user) {
                updateUser(res.data.user);
            } else {
                fetchUser();
            }

            setMessage("Profile updated successfully!");
            setIsEditing(false);
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <section className="profile-section">
                <div className="container text-center">
                    <h4>Loading profile...</h4>
                </div>
            </section>
        );
    }

    const joinedYear = user.createdAt
        ? new Date(user.createdAt).getFullYear()
        : "2026";

    return (
        <section className="profile-section">
            <div className="container">
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="profile-card">
                    <div className="profile-image">
                        {previewUrl ? (
                            <img src={previewUrl} alt={user.fullName} />
                        ) : (
                            "👤"
                        )}
                    </div>

                    {!isEditing ? (
                        <>
                            <h1>{user.fullName}</h1>
                            <p className="joined">Member since {joinedYear} • 📍 {user.location}</p>
                            {user.phone && <p className="text-muted mb-1">📞 {user.phone}</p>}
                            <p className="bio">{user.bio || "No bio added yet."}</p>

                            <button
                                className="btn btn-outline-success btn-sm mt-3 mb-3"
                                onClick={() => setIsEditing(true)}
                            >
                                ✏️ Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSave} className="w-100 text-start mt-3">
                            <div className="mb-3">
                                <label className="form-label">Profile Picture</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.fullName}
                                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.location}
                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Phone</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Bio</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="trust-cards mt-4">
                        <div>
                            ⭐
                            <strong>{user.averageRating || 0}</strong>
                            <span>Rating</span>
                        </div>
                        <div>
                            🔄
                            <strong>{user.totalCompletedExchanges || 0}</strong>
                            <span>Exchanges</span>
                        </div>
                        <div>
                            ✅
                            <strong>{user.exchangeSuccessRate || 0}%</strong>
                            <span>Success Rate</span>
                        </div>
                    </div>
                </div>

                <div className="profile-section-box mt-4">
                    <h3>Reviews</h3>
                    <div className="review-card">
                        <h5>No reviews yet</h5>
                        <p>⭐⭐⭐⭐⭐</p>
                        <span>Your completed exchange reviews will be displayed here.</span>
                    </div>
                </div>

                <div className="profile-section-box mt-4">
                    <h3>Exchange History</h3>
                    <div className="history-card">
                        <span>Completed exchanges will appear here.</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
