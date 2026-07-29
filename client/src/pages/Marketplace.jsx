import ListingCard from "../components/marketplace/ListingCard";
import "./Marketplace.css";

export default function Marketplace() {


  // Temporary data
  // Later replaced by:
  // GET /api/listings

  const listings = [

    {
      image: "📷",
      title: "DSLR Camera",
      category: "Electronics",
      owner: "Alex",
      wants: "Guitar"
    },

    {
      image: "🎸",
      title: "Acoustic Guitar",
      category: "Hobbies",
      owner: "Rahul",
      wants: "Camera"
    },

    {
      image: "📱",
      title: "Smartphone",
      category: "Electronics",
      owner: "Justin",
      wants: "Laptop"
    },

    {
      image: "💻",
      title: "Gaming Laptop",
      category: "Electronics",
      owner: "Arun",
      wants: "Phone"
    },

    {
      image: "⌚",
      title: "Smart Watch",
      category: "Accessories",
      owner: "Kevin",
      wants: "Headphones"
    },

    {
      image: "🎧",
      title: "Wireless Headphones",
      category: "Accessories",
      owner: "John",
      wants: "Smart Watch"
    }

  ];




  return (

    <section className="marketplace-section">


      <div className="container">


        <div className="marketplace-header">


          <span className="section-badge">
            MARKETPLACE
          </span>


          <h1>
            Find Items To Swap
          </h1>


          <p>
            Explore available items and discover
            possible exchanges with other users.
          </p>


        </div>





        {/* Search and Filter */}


        <div className="marketplace-tools">


          <input
            type="text"
            placeholder="Search items..."
          />



          <select>

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
              Hobbies
            </option>

          </select>



        </div>





        {/* Listings */}


        <div className="row g-4">


          {listings.map((listing,index)=>(

            <div
              className="col-lg-4 col-md-6"
              key={index}
            >

              <ListingCard
                listing={listing}
              />

            </div>


          ))}


        </div>


      </div>


    </section>

  );

}