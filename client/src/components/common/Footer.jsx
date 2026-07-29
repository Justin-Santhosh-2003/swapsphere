function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-auto">
      <div className="container">
        <small>
          © {new Date().getFullYear()} SwapSphere. All Rights Reserved.
        </small>
      </div>
    </footer>
  );
}

export default Footer;