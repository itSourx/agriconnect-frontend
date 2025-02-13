import React from "react";

import ScrollToTop from "react-scroll-to-top";

import LogingForm from "components/LogingForm";
import HeaderTwo from "components/HeaderTwo";
import ColorInit from "helper/ColorInit";
import Preloader from "helper/Preloader";
import Breadcrumb from "components/Breadcrumb";
import ShippingOne from "components/ShippingOne";
import FooterTwo from "components/FooterTwo";
import BottomFooter from "components/BottomFooter";


const LoginPage = () => {

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      <HeaderTwo category={true} />
      <Breadcrumb title={"Account"} />
      <div className=" d-flex flex-row justify-content-center align-items-center p-40 ">
      <LogingForm />
      </div>
      
      <FooterTwo />
      <BottomFooter />
    </>
  );
};

export default LoginPage;

