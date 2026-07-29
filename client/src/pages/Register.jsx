import { Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  return (
    <section className="login-page">

      <div className="container">

        <div className="login-card">

          <div className="text-center mb-4">

            <h2 className="login-logo">
              SwapSphere
            </h2>

            <p className="login-subtitle">
              Create your account and start swapping.
            </p>

          </div>





          <form>

            <div className="mb-3">

              <label className="form-label">
                Full Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
              />

            </div>





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
                placeholder="Create a password"
              />

            </div>





            <div className="mb-4">

              <label className="form-label">
                Confirm Password
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
              />

            </div>





            <button
              className="btn btn-success w-100 login-btn"
            >
              Register
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

            Already have an account?

            <Link to="/login">

              Login

            </Link>

          </p>

        </div>

      </div>

    </section>
  );
}