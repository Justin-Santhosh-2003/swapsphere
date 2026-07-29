import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {

  return (

    <section className="notfound-page">

      <div className="container">


        <div className="notfound-card">


          <h1>
            404
          </h1>


          <h2>
            Page Not Found
          </h2>


          <p>
            Sorry, the page you are looking for does not exist
            or may have been moved.
          </p>



          <Link
            to="/"
            className="btn btn-success"
          >

            Go Home

          </Link>


        </div>


      </div>

    </section>

  );

}