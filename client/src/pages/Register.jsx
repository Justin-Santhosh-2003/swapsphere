import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../api/axios";

import "./Register.css";


export default function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({

        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: ""

    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    // =========================================
    // HANDLE INPUT CHANGE
    // =========================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    // =========================================
    // HANDLE REGISTRATION
    // =========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        const {
            fullName,
            email,
            password,
            confirmPassword,
            location
        } = formData;


        // =====================================
        // FRONTEND VALIDATION
        // =====================================

        if (
            !fullName ||
            !email ||
            !password ||
            !confirmPassword ||
            !location
        ) {

            setError(
                "Please fill all required fields."
            );

            return;

        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        if (password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;

        }


        try {

            setLoading(true);


            // =====================================
            // REGISTER USER
            // =====================================

            const response = await API.post(

                "/auth/register",

                {
                    fullName,
                    email,
                    password,
                    location
                }

            );


            // =====================================
            // SAVE JWT TOKEN
            // =====================================

            localStorage.setItem(

                "token",

                response.data.token

            );


            // =====================================
            // SAVE USER DATA
            // =====================================

            if (response.data.user) {

                localStorage.setItem(

                    "user",

                    JSON.stringify(
                        response.data.user
                    )

                );

            }


            // =====================================
            // NOTIFY NAVBAR
            // =====================================

            window.dispatchEvent(

                new Event("authChanged")

            );


            // =====================================
            // GO TO HOME
            // =====================================

            navigate("/");


        }

        catch (error) {

            console.error(

                "Registration error:",

                error.response?.data || error

            );


            setError(

                error.response?.data?.message ||

                "Registration failed. Please try again."

            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <section className="register-section">


            <div className="container">


                <div className="login-card">


                    {/* HEADER */}

                    <div className="text-center mb-4">

                        <h2 className="login-logo">
                            SwapSphere
                        </h2>

                        <p className="login-subtitle">

                            Create your account and start swapping.

                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}


                    {/* REGISTER FORM */}

                    <form onSubmit={handleSubmit}>


                        {/* FULL NAME */}

                        <div className="mb-3">

                            <label className="form-label">

                                Full Name

                            </label>


                            <input

                                type="text"

                                name="fullName"

                                className="form-control"

                                placeholder="Enter your full name"

                                value={formData.fullName}

                                onChange={handleChange}

                            />

                        </div>


                        {/* EMAIL */}

                        <div className="mb-3">

                            <label className="form-label">

                                Email Address

                            </label>


                            <input

                                type="email"

                                name="email"

                                className="form-control"

                                placeholder="Enter your email"

                                value={formData.email}

                                onChange={handleChange}

                            />

                        </div>


                        {/* LOCATION */}

                        <div className="mb-3">

                            <label className="form-label">

                                Location

                            </label>


                            <input

                                type="text"

                                name="location"

                                className="form-control"

                                placeholder="Enter your location"

                                value={formData.location}

                                onChange={handleChange}

                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="mb-3">

                            <label className="form-label">

                                Password

                            </label>


                            <input

                                type="password"

                                name="password"

                                className="form-control"

                                placeholder="Create a password"

                                value={formData.password}

                                onChange={handleChange}

                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="mb-4">

                            <label className="form-label">

                                Confirm Password

                            </label>


                            <input

                                type="password"

                                name="confirmPassword"

                                className="form-control"

                                placeholder="Confirm your password"

                                value={formData.confirmPassword}

                                onChange={handleChange}

                            />

                        </div>


                        {/* REGISTER BUTTON */}

                        <button

                            type="submit"

                            className="btn btn-success w-100 login-btn"

                            disabled={loading}

                        >

                            {loading

                                ? "Creating Account..."

                                : "Register"

                            }

                        </button>


                    </form>


                    {/* DIVIDER */}

                    <div className="divider">

                        <span>OR</span>

                    </div>


                    {/* GOOGLE */}

                    <button

                        type="button"

                        className="btn btn-outline-dark w-100 google-btn"

                    >

                        <span className="google-icon">

                            G

                        </span>

                        Continue with Google

                    </button>


                    {/* LOGIN LINK */}

                    <p className="register-text">

                        Already have an account?

                        {" "}

                        <Link to="/login">

                            Login

                        </Link>

                    </p>


                </div>

            </div>

        </section>

    );

}
