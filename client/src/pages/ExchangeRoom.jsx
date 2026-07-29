import "./ExchangeRoom.css";

export default function ExchangeRoom() {


  const messages = [

    {
      sender:"Alex",
      text:"When can we complete the exchange?"
    },

    {
      sender:"Justin",
      text:"Tomorrow evening works for me."
    },

    {
      sender:"Alex",
      text:"Great, let's meet at Kottayam town."
    }

  ];




  return (

    <section className="exchange-room-section">


      <div className="container">





        <div className="room-header">


          <span>
            EXCHANGE ROOM
          </span>


          <h1>
            DSLR Camera ↔ Guitar
          </h1>


          <p>
            Coordinate your exchange securely with the other participant.
          </p>


        </div>








        <div className="row g-4">





          <div className="col-lg-8">



            <div className="chat-card">


              <h3>
                Messages
              </h3>



              <div className="messages">


                {messages.map((message,index)=>(

                  <div
                    className={
                      message.sender==="Justin"
                      ?
                      "message own"
                      :
                      "message"
                    }
                    key={index}
                  >


                    <strong>
                      {message.sender}
                    </strong>


                    <p>
                      {message.text}
                    </p>


                  </div>


                ))}


              </div>





              <div className="message-input">


                <input
                  type="text"
                  placeholder="Type a message..."
                />


                <button>
                  Send
                </button>


              </div>



            </div>



          </div>








          <div className="col-lg-4">



            <div className="exchange-info-card">


              <h3>
                Exchange Details
              </h3>



              <div className="exchange-item">


                <span>
                  📷
                </span>


                <p>
                  DSLR Camera
                  <small>
                    Justin
                  </small>
                </p>


              </div>





              <div className="exchange-arrow">

                ↔

              </div>






              <div className="exchange-item">


                <span>
                  🎸
                </span>


                <p>
                  Guitar
                  <small>
                    Alex
                  </small>
                </p>


              </div>



            </div>









            <div className="meeting-card">


              <h3>
                Meeting Details
              </h3>



              <p>
                📍 Kottayam Town
              </p>


              <p>
                📅 August 10, 2026
              </p>


              <p>
                ⏰ 5:00 PM
              </p>





              <button>

                Confirm Exchange

              </button>



            </div>




          </div>





        </div>




      </div>


    </section>

  );

}