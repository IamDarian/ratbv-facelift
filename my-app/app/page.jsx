"use client";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import SectionLines from "@/components/Homepage/SectionLines";
import SectionCarousel from "@/components/Homepage/SectionCarousel";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const [pageWidth, setPageWidth] = useState(null);

  useEffect(() => {
    const handleWidthResize = () => {
      setPageWidth(window.innerWidth);
    };
    handleWidthResize();
    window.addEventListener("resize", handleWidthResize);
    return () => window.removeEventListener("resize", handleWidthResize);
  }, []);

  const [pageHeight, setPageHeight] = useState(null);

  useEffect(() => {
    const handleHeightResize = () => {
      setPageHeight(window.innerHeight);
    };
    handleHeightResize();
    window.addEventListener("resize", handleHeightResize);
    return () => window.removeEventListener("resize", handleHeightResize);
  }, []);

  return (
    <>
      {loading && pageHeight ? (
        <Loading />
      ) : (
        <main>
          {pageWidth > 768 && (
            <div className="relative z-10 bg-gray-400 h-[93px] w-full"></div>
          )}
          <section
            className="relative flex flex-col justify-center items-center"
            style={
              pageWidth > 1024
                ? { height: `${pageHeight - 155}px` }
                : { height: "100svh" }
            }
          >
            <SectionCarousel />
          </section>
          <SectionLines />
        </main>
      )}
    </>
  );
};

export default Home;
