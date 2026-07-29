import "./Profile.css";

export default function Profile() {


  const user = {

    name: "Justin Santhosh",

    image: "👤",

    joined: "2026",

    bio:
      "Student interested in technology, gadgets, and meaningful exchanges.",


    rating: "4.8",

    exchanges: "15",

    successRate: "95%"

  };





  const reviews = [

    {
      user:"Alex",
      rating:"⭐⭐⭐⭐⭐",
      text:"Smooth exchange experience. Item was exactly as described."
    },

    {
      user:"Rahul",
      rating:"⭐⭐⭐⭐",
      text:"Friendly communication and quick exchange."
    }

  ];





  const history = [

    {
      give:"📷 DSLR Camera",
      receive:"🎸 Guitar"
    },

    {
      give:"💻 Laptop",
      receive:"📱 Smartphone"
    }

  ];





  return (

    <section className="profile-section">


      <div className="container">



        <div className="profile-card">



          <div className="profile-image">

            {user.image}

          </div>




          <h1>
            {user.name}
          </h1>


          <p className="joined">

            Member since {user.joined}

          </p>




          <p className="bio">

            {user.bio}

          </p>





          <div className="trust-cards">


            <div>

              ⭐

              <strong>
                {user.rating}
              </strong>

              <span>
                Rating
              </span>

            </div>



            <div>

              🔄

              <strong>
                {user.exchanges}
              </strong>

              <span>
                Exchanges
              </span>

            </div>



            <div>

              ✅

              <strong>
                {user.successRate}
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



          {reviews.map((review,index)=>(


            <div
              className="review-card"
              key={index}
            >


              <h5>
                {review.user}
              </h5>


              <p>
                {review.rating}
              </p>


              <span>
                {review.text}
              </span>


            </div>


          ))}


        </div>







        <div className="profile-section-box">


          <h3>
            Exchange History
          </h3>



          {history.map((exchange,index)=>(


            <div
              className="history-card"
              key={index}
            >


              <span>
                {exchange.give}
              </span>


              <strong>
                ↔
              </strong>


              <span>
                {exchange.receive}
              </span>


            </div>


          ))}



        </div>




      </div>


    </section>

  );

}