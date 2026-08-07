import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getCategories } from "../api/categoryApi";

import { createItem } from "../api/itemApi";

import "./CreateListing.css";

export default function CreateListing() {

  const navigate = useNavigate();

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

  useEffect(() => {

    const fetchCategories = async () => {

      try {

        const res = await getCategories();

        setCategories(res.data.categories);

      }

      catch (error) {

        console.error(error);

      }

    };

    fetchCategories();

  }, []);

  useEffect(() => {

    if (!selectedCategory) {

      setSubcategories([]);

      setSelectedSubcategory("");

      return;

    }

    const category = categories.find(

      (cat) => cat._id === selectedCategory

    );

    if (category) {

      setSubcategories(category.subcategories || []);

    }

    else {

      setSubcategories([]);

    }

    setSelectedSubcategory("");

  }, [selectedCategory, categories]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createItem(formData);

      alert("Listing created successfully!");

      navigate("/marketplace");

    }

    catch (error) {

      console.error(error);

      alert(

        error.response?.data?.message ||

        "Failed to create listing."

      );

    }

  };

  return (

    <section className="create-listing-section">


      <div className="container">


        <div className="listing-form-card">


          <div className="listing-header">


            <span className="section-badge">
              CREATE LISTING
            </span>


            <h1>
              List an Item for Exchange
            </h1>


            <p>
              Add your item details and tell others
              what you would like to receive in return.
            </p>


          </div>





          <form onSubmit={handleSubmit}>


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
              />


            </div>





            <div className="form-row">


              <div className="form-group">

                <label>
                  Category
                </label>

                <select

                  value={selectedCategory}

                  onChange={(e) => {

                    setSelectedCategory(e.target.value);

                    setFormData({

                      ...formData,

                      categoryId: e.target.value,

                      subcategory: ""

                    });

                  }}

                >

                  <option value="">
                    Select Category
                  </option>

                  {

                    categories.map((category) => (

                      <option

                        key={category._id}

                        value={category._id}

                      >

                        {category.name}

                      </option>

                    ))

                  }

                </select>

              </div>





              <div className="form-group">

                <label>
                  Subcategory
                </label>

                <select

                  value={selectedSubcategory}

                  onChange={(e) => {

                    setSelectedSubcategory(e.target.value);

                    setFormData({

                      ...formData,

                      subcategory: e.target.value

                    });

                  }}

                  disabled={!selectedCategory}

                >

                  <option value="">
                    Select Subcategory
                  </option>

                  {

                    subcategories.map((subcategory) => (

                      <option

                        key={subcategory}

                        value={subcategory}

                      >

                        {subcategory}

                      </option>

                    ))

                  }

                </select>

              </div>

            </div>


            <div className="form-group">

              <label>
                Condition
              </label>

              <select

                name="condition"

                value={formData.condition}

                onChange={handleChange}

              >

                <option value="LIKE_NEW">Like New</option>

                <option value="EXCELLENT">Excellent</option>

                <option value="GOOD">Good</option>

                <option value="FAIR">Fair</option>

                <option value="POOR">Poor</option>

              </select>

            </div>




            <div className="form-group">


              <label>
                Description
              </label>


              <textarea
                rows="5"
                name="description"
                placeholder="Describe your item..."
                value={formData.description}
                onChange={handleChange}
              />


            </div>







            <div className="form-group">


              <label>
                Upload Images
              </label>


              <input
                type="file"
                multiple
              />


            </div>







            <div className="exchange-preferences">


              <h4>
                Exchange Preferences
              </h4>


              <p>
                Add items you are interested in receiving.
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







            <button
              type="submit"
              className="create-button"
            >

              Create Listing

            </button>



          </form>



        </div>


      </div>


    </section>

  );

}