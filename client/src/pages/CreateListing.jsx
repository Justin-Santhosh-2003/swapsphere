import "./CreateListing.css";

export default function CreateListing() {


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





          <form>


            <div className="form-group">


              <label>
                Item Name
              </label>


              <input
                type="text"
                placeholder="Enter item name"
              />


            </div>





            <div className="form-row">


              <div className="form-group">


                <label>
                  Category
                </label>


                <select>

                  <option>
                    Select Category
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





              <div className="form-group">


                <label>
                  Subcategory
                </label>


                <select>

                  <option>
                    Select Subcategory
                  </option>

                  <option>
                    Camera
                  </option>

                  <option>
                    Mobile
                  </option>

                  <option>
                    Gaming
                  </option>

                </select>


              </div>


            </div>







            <div className="form-group">


              <label>
                Description
              </label>


              <textarea
                rows="5"
                placeholder="Describe your item..."
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







            <button className="create-button">

              Create Listing

            </button>



          </form>



        </div>


      </div>


    </section>

  );

}