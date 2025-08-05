import Navbar from '../Navbar'
import Main from "../Main";
import React from "react";
import Cards from '../cards';
import Footer from '@/components/layout/Footer';

type Props = {};

const page = (props: Props) => {
  return (
    <div className='h-full'>
      <Navbar />
      <Main />
      <Cards />
      <Footer />
    </div>
  );
};

export default page;