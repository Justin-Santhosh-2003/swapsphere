import { useEffect, useState } from "react";

import "./Marketplace.css";

import ListingCard from "../components/marketplace/ListingCard";

import { getItems } from "../api/itemApi";

export default function Marketplace() {

  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchItems = async () => {

      try {

        const res = await getItems();

        setListings(res.data.items);

      }

      catch (error) {

        console.error(error);

      }

      finally {

        setLoading(false);

      }

    };

    fetchItems();

  }, []);

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
          />



          <select className="form-select">

            <option>
              All Categories
            </option>

            <option>
              Electronics
            </option>

            <option>
              Books
            </option>

            <option>
              Furniture
            </option>

          </select>





          <select className="form-select">

            <option>
              All Subcategories
            </option>

            <option>
              Mobile
            </option>

            <option>
              Laptop
            </option>

            <option>
              Camera
            </option>

          </select>





          <select className="form-select">

            <option>
              Sort By
            </option>

            <option>
              Recently Added
            </option>

            <option>
              Most Popular
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






      </div>


    </section>

  );

}