"use client";

import { useState, useEffect } from "react";
import Loading from "@/components/Loading";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return <div>{loading ? <Loading /> : <div>Home</div>}</div>;
};

export default Home;
