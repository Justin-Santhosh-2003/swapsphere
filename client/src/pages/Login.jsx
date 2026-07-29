import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  return (
    <section className="login-page">

      <div className="container">

        <div className="login-card">

          <div className="text-center mb-4">

            <h2 className="login-logo">
              SwapSphere
            </h2>

            <p className="login-subtitle">
              Welcome back! Sign in to continue swapping.
            </p>

          </div>




          <form>

            <div className="mb-3">

              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
              />

            </div>




            <div className="mb-3">

              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
              />

            </div>




            <div className="text-end mb-4">

              <Link
                to="#"
                className="forgot-password"
              >
                Forgot Password?
              </Link>

            </div>





            <button
              className="btn btn-success w-100 login-btn"
            >
              Login
            </button>

          </form>






          <div className="divider">

            <span>OR</span>

          </div>






          <button
            className="btn btn-outline-dark w-100 google-btn"
          >

            <span className="google-icon">
              G
            </span>

            Continue with Google

          </button>







          <p className="register-text">

            Don't have an account?

            <Link to="/register">

              Register

            </Link>

          </p>



        </div>

      </div>

    </section>
  );
}