import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">

      <Navbar />

      <main className="container my-4 flex-grow-1">
        {children}
      </main>

      <Footer />

    </div>
  );
}

export default MainLayout;