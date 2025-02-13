import { BrowserRouter, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import PhosphorIconInit from "./helper/PhosphorIconInit";
import HomePageTwo from "./pages/HomePageTwo";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPageOne from "./pages/ProductDetailsPageOne";
import ProductDetailsPageTwo from "./pages/ProductDetailsPageTwo";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "pages/LoginPage";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterPage from "pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <PhosphorIconInit />
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<HomePageOne />} />
          <Route exact path="/index-two" element={<HomePageTwo />} />
          <Route exact path="/shop" element={<ShopPage />} />
          <Route exact path="/product-details" element={<ProductDetailsPageOne />} />
          <Route exact path="/product-details-two" element={<ProductDetailsPageTwo />} />
          <Route exact path="/cart" element={<CartPage />} />
          <Route exact path="/checkout" element={<CheckoutPage />} />
          <Route exact path="/account" element={<AccountPage />} />
          <Route exact path="/blog" element={<BlogPage />} />
          <Route exact path="/blog-details" element={<BlogDetailsPage />} />
          <Route exact path="/contact" element={<ContactPage />} />
          <Route exact path="/sign-in" element={<LoginPage />} />
          <Route exact path="/register" element={<RegisterPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
