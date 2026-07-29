import "./Marketplace.css";
import ListingCard from "../components/marketplace/ListingCard";

export default function Marketplace() {


  // Temporary dummy data
  // Later this will come from MongoDB through API

  const listings = [

    {
      id: 1,
      title: "Canon DSLR Camera",
      category: "Electronics",
      subCategory: "Camera",
      condition: "Good",
      owner: "Justin",
      image: "📷"
    },


    {
      id: 2,
      title: "Acoustic Guitar",
      category: "Musical Instruments",
      subCategory: "Guitar",
      condition: "Excellent",
      owner: "Alex",
      image: "🎸"
    },


    {
      id: 3,
      title: "iPhone 13",
      category: "Electronics",
      subCategory: "Mobile",
      condition: "Like New",
      owner: "Rahul",
      image: "📱"
    },


    {
      id: 4,
      title: "Gaming Laptop",
      category: "Electronics",
      subCategory: "Laptop",
      condition: "Good",
      owner: "Arjun",
      image: "💻"
    }

  ];





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
            listings.length > 0 ? (

              listings.map((item)=>(

                <ListingCard
                  key={item.id}
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