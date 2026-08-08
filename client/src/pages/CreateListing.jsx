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


    // =========================================
    // HANDLE SUBMIT
    // =========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            if (isEditMode) {

                // =================================
                // UPDATE EXISTING LISTING
                // =================================

                await API.put(

                    `/items/${id}`,

                    formData

                );


                alert(
                    "Listing updated successfully!"
                );


                navigate("/dashboard");

            }

            else {

                // =================================
                // CREATE NEW LISTING
                // =================================

                await createItem(
                    formData
                );


                alert(
                    "Listing created successfully!"
                );


                navigate("/marketplace");

            }

        }

        catch (error) {

            console.error(
                "Failed to save listing:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Failed to save listing."

            );

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

                        <div className="form-group">


                            <label>
                                Upload Images
                            </label>


                            <input
                                type="file"
                                multiple
                            />


                            {isEditMode &&
                                formData.images.length > 0 && (

                                    <small
                                        className="text-muted"
                                    >

                                        Existing images are
                                        currently preserved.

                                    </small>

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
                                Add items you are interested
                                in receiving.
                            </p>


                            <div className="preference">


                                <span>
                                    Priority 1
                                </span>


                                <select>

                                    <option>
                                        Select Item
                                    </option>

                                    <option>
                                        Guitar
                                    </option>

                                    <option>
                                        Laptop
                                    </option>

                                    <option>
                                        Phone
                                    </option>

                                </select>


                            </div>


                            <div className="preference">


                                <span>
                                    Priority 2
                                </span>


                                <select>

                                    <option>
                                        Select Item
                                    </option>

                                    <option>
                                        Guitar
                                    </option>

                                    <option>
                                        Laptop
                                    </option>

                                    <option>
                                        Phone
                                    </option>

                                </select>


                            </div>


                            <div className="preference">


                                <span>
                                    Priority 3
                                </span>


                                <select>

                                    <option>
                                        Select Item
                                    </option>

                                    <option>
                                        Guitar
                                    </option>

                                    <option>
                                        Laptop
                                    </option>

                                    <option>
                                        Phone
                                    </option>

                                </select>


                            </div>


                        </div>


                        {/* =================================
                            SUBMIT
                        ================================= */}

                        <button

                            type="submit"

                            className="create-button"

                        >

                            {isEditMode
                                ? "Update Listing"
                                : "Create Listing"}

                        </button>


                    </form>


                </div>


            </div>


        </section>

    );

}
