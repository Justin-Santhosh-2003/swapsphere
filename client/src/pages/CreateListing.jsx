import { useEffect, useState } from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import { getCategories } from "../api/categoryApi";

import {
    createItem
} from "../api/itemApi";

import API from "../api/axios";

import "./CreateListing.css";


export default function CreateListing() {

    const navigate = useNavigate();

    const { id } = useParams();

    // If an id exists, we are editing
    const isEditMode = Boolean(id);


    const [categories, setCategories] = useState([]);

    const [subcategories, setSubcategories] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState("");

    const [selectedSubcategory, setSelectedSubcategory] = useState("");


    const [formData, setFormData] = useState({

        title: "",

        description: "",

        categoryId: "",

        subcategory: "",

        condition: "GOOD",

        images: [],

        videos: [],

        exchangePreferences: []

    });


    const [loading, setLoading] = useState(
        isEditMode
    );


    // =========================================
    // FETCH CATEGORIES
    // =========================================

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const res = await getCategories();

                setCategories(
                    res.data.categories || []
                );

            }

            catch (error) {

                console.error(
                    "Failed to fetch categories:",
                    error
                );

            }

        };


        fetchCategories();

    }, []);


    // =========================================
    // FETCH EXISTING ITEM WHEN EDITING
    // =========================================

    useEffect(() => {

        if (!isEditMode) {

            return;

        }


        const fetchItem = async () => {

            try {

                const res = await API.get(
                    `/items/${id}`
                );


                const item =
                    res.data.item || res.data;


                setFormData({

                    title: item.title || "",

                    description:
                        item.description || "",

                    categoryId:
                        item.categoryId?._id ||
                        item.categoryId ||
                        "",

                    subcategory:
                        item.subcategory || "",

                    condition:
                        item.condition || "GOOD",

                    images:
                        item.images || [],

                    videos:
                        item.videos || [],

                    exchangePreferences:
                        item.exchangePreferences || []

                });


                setSelectedCategory(
                    item.categoryId?._id ||
                    item.categoryId ||
                    ""
                );


                setSelectedSubcategory(
                    item.subcategory || ""
                );

            }

            catch (error) {

                console.error(
                    "Failed to fetch listing:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Unable to load listing."
                );

                navigate("/dashboard");

            }

            finally {

                setLoading(false);

            }

        };


        fetchItem();

    }, [id, isEditMode, navigate]);


    // =========================================
    // UPDATE SUBCATEGORIES
    // =========================================

    useEffect(() => {

        if (!selectedCategory) {

            setSubcategories([]);

            return;

        }


        const category = categories.find(

            (cat) =>
                cat._id === selectedCategory

        );


        if (category) {

            setSubcategories(
                category.subcategories || []
            );

        }

        else {

            setSubcategories([]);

        }

    }, [
        selectedCategory,
        categories
    ]);


    // =========================================
    // HANDLE INPUT CHANGE
    // =========================================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value

        });

    };


    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles((prev) => [...prev, ...files]);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...urls]);
    };

    const removeNewFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // =========================================
    // HANDLE SUBMIT
    // =========================================

    const handleSubmit = async (e) => {

        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("categoryId", formData.categoryId);
            data.append("subcategory", formData.subcategory);
            data.append("condition", formData.condition);
            data.append("images", JSON.stringify(formData.images));
            data.append("exchangePreferences", JSON.stringify(formData.exchangePreferences));

            selectedFiles.forEach((file) => {
                data.append("images", file);
            });

            if (isEditMode) {
                await API.put(`/items/${id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                alert("Listing updated successfully!");
                navigate("/dashboard");
            } else {
                await API.post("/items", data, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                alert("Listing created successfully!");
                navigate("/marketplace");
            }
        } catch (error) {
            console.error("Failed to save listing:", error);
            alert(error.response?.data?.message || "Failed to save listing.");
        } finally {
            setSubmitting(false);
        }

    };


    // =========================================
    // LOADING EDIT FORM
    // =========================================

    if (loading) {

        return (

            <section className="create-listing-section">

                <div className="container text-center">

                    <h4>
                        Loading listing...
                    </h4>

                </div>

            </section>

        );

    }


    return (

        <section className="create-listing-section">


            <div className="container">


                <div className="listing-form-card">


                    <div className="listing-header">


                        <span className="section-badge">

                            {isEditMode
                                ? "EDIT LISTING"
                                : "CREATE LISTING"}

                        </span>


                        <h1>

                            {isEditMode

                                ? "Edit Your Listing"

                                : "List an Item for Exchange"}

                        </h1>


                        <p>

                            {isEditMode

                                ? "Update your item details and exchange preferences."

                                : "Add your item details and tell others what you would like to receive in return."}

                        </p>


                    </div>


                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =================================
                            ITEM NAME
                        ================================= */}

                        <div className="form-group">


                            <label>
                                Item Name
                            </label>


                            <input
                                type="text"
                                name="title"
                                placeholder="Enter item name"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />


                        </div>


                        {/* =================================
                            CATEGORY + SUBCATEGORY
                        ================================= */}

                        <div className="form-row">


                            <div className="form-group">


                                <label>
                                    Category
                                </label>


                                <select

                                    value={
                                        selectedCategory
                                    }

                                    onChange={(e) => {

                                        const categoryId =
                                            e.target.value;


                                        setSelectedCategory(
                                            categoryId
                                        );


                                        setSelectedSubcategory(
                                            ""
                                        );


                                        setFormData({

                                            ...formData,

                                            categoryId,

                                            subcategory: ""

                                        });

                                    }}

                                    required

                                >


                                    <option value="">

                                        Select Category

                                    </option>


                                    {categories.map(
                                        (category) => (

                                            <option

                                                key={
                                                    category._id
                                                }

                                                value={
                                                    category._id
                                                }

                                            >

                                                {
                                                    category.name
                                                }

                                            </option>

                                        )
                                    )}


                                </select>


                            </div>


                            <div className="form-group">


                                <label>
                                    Subcategory
                                </label>


                                <select

                                    value={
                                        selectedSubcategory
                                    }

                                    onChange={(e) => {

                                        const subcategory =
                                            e.target.value;


                                        setSelectedSubcategory(
                                            subcategory
                                        );


                                        setFormData({

                                            ...formData,

                                            subcategory

                                        });

                                    }}

                                    disabled={
                                        !selectedCategory
                                    }

                                    required

                                >


                                    <option value="">

                                        Select Subcategory

                                    </option>


                                    {subcategories.map(
                                        (subcategory) => (

                                            <option

                                                key={
                                                    subcategory
                                                }

                                                value={
                                                    subcategory
                                                }

                                            >

                                                {
                                                    subcategory
                                                }

                                            </option>

                                        )
                                    )}


                                </select>


                            </div>


                        </div>


                        {/* =================================
                            CONDITION
                        ================================= */}

                        <div className="form-group">


                            <label>
                                Condition
                            </label>


                            <select

                                name="condition"

                                value={
                                    formData.condition
                                }

                                onChange={
                                    handleChange
                                }

                                required

                            >


                                <option value="LIKE_NEW">
                                    Like New
                                </option>

                                <option value="EXCELLENT">
                                    Excellent
                                </option>

                                <option value="GOOD">
                                    Good
                                </option>

                                <option value="FAIR">
                                    Fair
                                </option>

                                <option value="POOR">
                                    Poor
                                </option>


                            </select>


                        </div>


                        {/* =================================
                            DESCRIPTION
                        ================================= */}

                        <div className="form-group">


                            <label>
                                Description
                            </label>


                            <textarea

                                rows="5"

                                name="description"

                                placeholder="Describe your item..."

                                value={
                                    formData.description
                                }

                                onChange={
                                    handleChange
                                }

                                required

                            />


                        </div>


                        {/* =================================
                            IMAGE UPLOAD
                        ================================= */}

                        <div className="form-group mb-4">
                            <label className="fw-semibold">Upload Images (Max 5)</label>
                            <input
                                type="file"
                                className="form-control mb-2"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                            />

                            {/* Existing Images */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="mb-2">
                                    <small className="text-muted d-block mb-1">Existing Images:</small>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {formData.images.map((url, idx) => (
                                            <div key={idx} className="position-relative">
                                                <img
                                                    src={url}
                                                    alt={`Existing ${idx}`}
                                                    style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px" }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                                                    style={{ width: "20px", height: "20px", fontSize: "10px", lineHeight: "1" }}
                                                    onClick={() => removeExistingImage(idx)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Upload Previews */}
                            {previewUrls.length > 0 && (
                                <div>
                                    <small className="text-muted d-block mb-1">New Images to Upload:</small>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="position-relative">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${idx}`}
                                                    style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px" }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                                                    style={{ width: "20px", height: "20px", fontSize: "10px", lineHeight: "1" }}
                                                    onClick={() => removeNewFile(idx)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* =================================
                            EXCHANGE PREFERENCES
                        ================================= */}

                        <div className="exchange-preferences">

                            <h4>
                                Exchange Preferences
                            </h4>

                            <p>
                                Add items you are interested in receiving in return (ordered by preference).
                            </p>

                            {formData.exchangePreferences.map((pref, index) => {
                                const selectedCatObj = categories.find((c) => c._id === (pref.categoryId?._id || pref.categoryId));
                                const prefSubcats = selectedCatObj ? selectedCatObj.subcategories || [] : [];

                                return (
                                    <div className="preference-row mb-3 p-3 border rounded" key={index}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <strong>Priority {index + 1}</strong>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => {
                                                    const updated = formData.exchangePreferences.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, exchangePreferences: updated });
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={pref.categoryId?._id || pref.categoryId || ""}
                                                    onChange={(e) => {
                                                        const catId = e.target.value;
                                                        const updated = [...formData.exchangePreferences];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            categoryId: catId,
                                                            subcategory: "",
                                                            priority: index + 1
                                                        };
                                                        setFormData({ ...formData, exchangePreferences: updated });
                                                    }}
                                                >
                                                    <option value="">Select Wanted Category</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat._id} value={cat._id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={pref.subcategory || ""}
                                                    onChange={(e) => {
                                                        const sub = e.target.value;
                                                        const updated = [...formData.exchangePreferences];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            subcategory: sub,
                                                            priority: index + 1
                                                        };
                                                        setFormData({ ...formData, exchangePreferences: updated });
                                                    }}
                                                    disabled={!(pref.categoryId?._id || pref.categoryId)}
                                                >
                                                    <option value="">Select Wanted Subcategory</option>
                                                    {prefSubcats.map((sub, i) => (
                                                        <option key={i} value={sub}>
                                                            {sub}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {formData.exchangePreferences.length < 5 && (
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm mt-2"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            exchangePreferences: [
                                                ...formData.exchangePreferences,
                                                { categoryId: "", subcategory: "", priority: formData.exchangePreferences.length + 1 }
                                            ]
                                        });
                                    }}
                                >
                                    + Add Preference
                                </button>
                            )}

                        </div>


                        {/* =================================
                            SUBMIT
                        ================================= */}

                        <button
                            type="submit"
                            className="create-button"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Saving & Uploading..."
                                : isEditMode
                                ? "Update Listing"
                                : "Create Listing"}
                        </button>


                    </form>


                </div>


            </div>


        </section>

    );

}
