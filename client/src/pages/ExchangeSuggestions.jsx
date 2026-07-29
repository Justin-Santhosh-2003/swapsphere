import "./ExchangeSuggestions.css";


export default function ExchangeSuggestions() {


  const directMatches = [

    {
      user1:"Justin",
      item1:"📷 DSLR Camera",

      user2:"Alex",
      item2:"🎸 Guitar"

    }

  ];




  const threeWayMatches = [

    {
      user1:"Justin",
      item1:"📷 DSLR Camera",

      user2:"Alex",
      item2:"🎸 Guitar",

      user3:"Rahul",
      item3:"📱 Smartphone"

    }

  ];





  return (

    <section className="suggestions-section">


      <div className="container">



        <div className="suggestions-header">


          <span>
            SMART MATCHING
          </span>


          <h1>
            Exchange Suggestions
          </h1>


          <p>
            Find possible item exchanges based on your preferences.
          </p>


        </div>








        <div className="suggestion-block">


          <h2>
            Direct Exchanges
          </h2>



          {
            directMatches.map((match,index)=>(

              <div
                className="direct-match"
                key={index}
              >


                <div className="exchange-user">


                  <div className="item-icon">
                    {match.item1.split(" ")[0]}
                  </div>


                  <h4>
                    {match.item1.substring(2)}
                  </h4>


                  <p>
                    {match.user1}
                  </p>


                </div>





                <div className="exchange-arrow">
                  ↔
                </div>





                <div className="exchange-user">


                  <div className="item-icon">
                    {match.item2.split(" ")[0]}
                  </div>


                  <h4>
                    {match.item2.substring(2)}
                  </h4>


                  <p>
                    {match.user2}
                  </p>


                </div>



              </div>


            ))
          }



        </div>









        <div className="suggestion-block">


          <h2>
            Three-Way Exchanges
          </h2>





          {
            threeWayMatches.map((match,index)=>(

              <div
                className="three-way"
                key={index}
              >



                <div className="cycle-card">


                  <span>
                    {match.item1.split(" ")[0]}
                  </span>


                  <h4>
                    {match.item1.substring(2)}
                  </h4>


                  <p>
                    {match.user1}
                  </p>


                </div>





                <div className="cycle-arrow">
                  ↓
                </div>






                <div className="cycle-card">


                  <span>
                    {match.item2.split(" ")[0]}
                  </span>


                  <h4>
                    {match.item2.substring(2)}
                  </h4>


                  <p>
                    {match.user2}
                  </p>


                </div>






                <div className="cycle-arrow">
                  ↓
                </div>






                <div className="cycle-card">


                  <span>
                    {match.item3.split(" ")[0]}
                  </span>


                  <h4>
                    {match.item3.substring(2)}
                  </h4>


                  <p>
                    {match.user3}
                  </p>


                </div>




                <div className="back-arrow">

                  ↺ Back to {match.user1}

                </div>



              </div>


            ))
          }




        </div>






      </div>


    </section>

  );

}