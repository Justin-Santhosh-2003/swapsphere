import { useParams } from "react-router-dom";
import "./ItemDetails.css";

export default function ItemDetails() {


  const { id } = useParams();



  // Temporary data
  // Later replaced by:
  // GET /api/items/:id


  const item = {

    image: "📷",

    title: "DSLR Camera",

    category: "Electronics",

    description:
      "A good condition DSLR camera suitable for photography enthusiasts and content creators.",

    owner: "Alex",

    wants: [
      "Guitar",
      "Laptop",
      "Smartphone"
    ],

    rating: "4.8",

    exchanges: 12

  };





  return (

    <section className="item-details-section">


      <div className="container">


        <div className="item-details-card">



          <div className="item-image">

            {item.image}

          </div>





          <div className="item-information">


            <span className="item-category">

              {item.category}

            </span>



            <h1>
              {item.title}
            </h1>



            <p className="item-description">

              {item.description}

            </p>





            <div className="owner-box">


              <h5>
                Owner
              </h5>


              <p>
                {item.owner}
              </p>



              <div className="trust-info">


                <span>
                  ⭐ {item.rating} Rating
                </span>


                <span>
                  🔄 {item.exchanges} Exchanges
                </span>


              </div>


            </div>







            <div className="exchange-box">


              <h5>
                Looking For
              </h5>



              <div className="wanted-items">


                {item.wants.map((want,index)=>(

                  <span key={index}>
                    {want}
                  </span>

                ))}


              </div>


            </div>





            <button className="exchange-button">

              Request Exchange

            </button>



          </div>


        </div>


      </div>


    </section>

  );

}