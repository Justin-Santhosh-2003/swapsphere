import { useEffect, useState } from "react";

import "./Marketplace.css";

import ListingCard from "../components/marketplace/ListingCard";

import { getItems } from "../api/itemApi";
import { getCategories } from "../api/categoryApi";

export default function Marketplace() {

  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");

  const [subcategories, setSubcategories] = useState([]);

  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const [selectedCondition, setSelectedCondition] = useState("");

  const [selectedSort, setSelectedSort] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

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

  useEffect(() => {

    const fetchItems = async () => {

      try {

        setLoading(true);

        const res = await getItems({

          search,

          categoryId: selectedCategory,

          subcategory: selectedSubcategory,

          condition: selectedCondition,

          sort: selectedSort,

          page: currentPage,

          limit: 6

        });

        setListings(res.data.items);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);

      }

      catch (error) {

        console.error(error);

      }

      finally {

        setLoading(false);

      }

    };

    const timer = setTimeout(() => {

      fetchItems();

    }, 500);

    return () => clearTimeout(timer);

  }, [

    search,

    selectedCategory,

    selectedSubcategory,

    selectedCondition,

    selectedSort,

    currentPage

  ]);

  useEffect(() => {

    setCurrentPage(1);

  }, [

    search,

    selectedCategory,

    selectedSubcategory,

    selectedCondition,

    selectedSort

  ]);

  return (

    <section className="marketplace-page">


      <div className="container">



        {/* HEADER */}

        <div className="marketplace-header">


          <h1>
            Marketplace
          </h1>


          <p>
            Discover items available for exchange.
            Find something you need and offer something you have.
          </p>


        </div>








        {/* SEARCH AND FILTERS */}

        <div className="marketplace-tools">



          <input
            type="text"
            className="form-control"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />



          <select

            className="form-select"

            value={selectedCategory}

            onChange={(e) => setSelectedCategory(e.target.value)}

          >

            <option value="">

              All Categories

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


          <select

            className="form-select"

            value={selectedSubcategory}

            onChange={(e) => setSelectedSubcategory(e.target.value)}

            disabled={!selectedCategory}

          >

            <option value="">

              All Subcategories

            </option>

            {

              subcategories.map((subcategory, index) => (

                <option

                  key={index}

                  value={subcategory}

                >

                  {subcategory}

                </option>

              ))

            }

          </select>

          <select

            className="form-select"

            value={selectedCondition}

            onChange={(e) => setSelectedCondition(e.target.value)}

          >

            <option value="">
              All Conditions
            </option>

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

          <select

            className="form-select"

            value={selectedSort}

            onChange={(e) => setSelectedSort(e.target.value)}

          >

            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

          </select>



        </div>









        {/* LISTINGS */}

        <div className="listing-grid">

          {

            loading ? (

              <div className="text-center w-100 mt-5">

                <h4>

                  Loading listings...

                </h4>

              </div>

            ) : listings.length > 0 ? (

              listings.map((item) => (

                <ListingCard

                  key={item._id}

                  listing={item}

                />

              ))

            ) : (

              <div className="empty-marketplace">

                <div className="empty-icon">

                  🔍

                </div>

                <h3>

                  No Listings Found

                </h3>

                <p>

                  Try changing your search or category filters.

                </p>

              </div>

            )

          }

        </div>

        {

          totalPages > 1 && (

            <div className="pagination-container">

              <button

                className="btn btn-outline-success"

                disabled={currentPage === 1}

                onClick={() => setCurrentPage(currentPage - 1)}

              >

                Previous

              </button>



              <span className="page-number">

                Page {currentPage} of {totalPages}

              </span>



              <button

                className="btn btn-outline-success"

                disabled={currentPage === totalPages}

                onClick={() => setCurrentPage(currentPage + 1)}

              >

                Next

              </button>

            </div>

          )

        }




      </div>


    </section>

  );

}