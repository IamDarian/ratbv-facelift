"use client";

// Hooks
import { useEffect, useState, useRef } from "react";
// Bus data
import { busData } from "@/busdata/busData";
// Components
import DesktopTable from "@/app/components/DesktopTable";
import MobileTable from "@/app/components/MobileTable";
// PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// Next
import Image from "next/image";
// Framer Motion
import { motion } from "framer-motion";
import { fadeIn } from "@/variants";
import { useInView } from "react-intersection-observer";

const Line = ({ params }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Schimba la false daca vrei sa declansezi animatia de fiecare data cand intra in viewport
    threshold: 0.6, // Ajusteaza cat de mult din element trebuie sa fie vizibil pentru a declansa animatia
  });

  const [lineData, setLineData] = useState({});

  const [width, setWidth] = useState(window.innerWidth);

  const lineNumber = params.lineNumber[0];

  useEffect(() => {
    const getLineData = async () => {
      const res = await fetch("/api/getLineData/");
      try {
        if (res.ok) {
          const data = await res.json();
          setLineData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getLineData();
  }, [lineNumber]);

  // useEffect(() => {
  //   const pushData = async () => {
  //     const res = await fetch("/api/pushData/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         data: busData,
  //       }),
  //     });
  //     try {
  //       if (res.ok) {
  //         console.log("Data sent successfully");
  //       }
  //     } catch (error) {
  //       console.log("Error while sending data:", error);
  //     }
  //   };

  //   pushData();
  // }, []);

  // console.log(lineData.data ? lineData.data : "Data is not yet available");

  const lineObject =
    lineData.data &&
    lineData.data.find((line) => line.lineNumber === parseInt(lineNumber));
  // console.log(lineObject);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = width <= 768;

  const [isReverse, setIsReverse] = useState(false);
  const [stations, setStations] = useState([]);

  const firstStopRef = useRef(null);

  useEffect(() => {
    if (firstStopRef.current) {
      const rect = firstStopRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const busElement = document.getElementById("bus");
      busElement.style.position = "absolute";
      busElement.style.left = `${rect.left + centerX - 25}px`;
      busElement.style.top = `${rect.top}px`;
      busElement.style.marginTop = "15px";
    }
  }, [lineObject, width, stations]);

  const formatDate = function (isoString) {
    let date = new Date(isoString);
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [currentStation, setCurrentStation] = useState(null);
  const [selectedStationData, setSelectedStationData] = useState(
    lineObject && lineObject.way.stopsTo[0].stop
  );

  useEffect(() => {
    if (
      lineObject &&
      lineObject.way.stopsTo &&
      lineObject.way.stopsTo.length > 0
    ) {
      setCurrentStation(lineObject.way.stopsTo[0].stop);
      setSelectedStationData(lineObject.way.stopsTo[0]);
    }
  }, [lineObject]);

  useEffect(() => {
    if (lineObject) {
      setStations(
        isReverse ? lineObject.way.stopsFrom : lineObject.way.stopsTo
      );
    }
  }, [lineObject, isReverse]);

  const [routeInfo, setRouteInfo] = useState("Loading...");

  useEffect(() => {
    if (lineObject) {
      setRouteInfo(lineObject.routeTo);
    }
  }, [lineObject]);

  const toggleReverse = () => {
    setIsReverse(!isReverse);
    const reversedStations = isReverse
      ? lineObject.way.stopsTo
      : lineObject.way.stopsFrom;

    setCurrentStation(reversedStations[0].stop);
    setSelectedStationData(reversedStations[0]);
    setRouteInfo(isReverse ? lineObject.routeTo : lineObject.routeFrom);
  };

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      const table = document.getElementById("pdf-table");

      const canvas = await html2canvas(table);
      const imgData = canvas.toDataURL("image/png");

      pdf.text(`Linia: ${lineNumber}`, 10, 10);
      pdf.text(`Directia: ${routeInfo}`, 10, 20);
      pdf.text(`Statia: ${currentStation}`, 10, 30);

      // Adăugarea imaginii după text
      pdf.addImage(imgData, "PNG", 10, 40, 190, 0);

      pdf.text(
        "Nota: Respectarea orelor de trecere poate fi influentata de conditiile de trafic!",
        10,
        170
      );

      pdf.save("table.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <section className="container mx-auto" ref={ref}>
      <motion.div
        variants={fadeIn("down", 0.2)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="w-full bg-accent rounded-lg flex items-center justify-center h-20 text-xl xl:text-3xl text-white font-bold mb-10"
      >
        <p className="mr-6 xl:mr-10 bg-white text-accent px-4 py-2 text-center rounded-xl">
          {lineNumber}
        </p>
        <h1
          variants={fadeIn("down", 0.2)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {routeInfo}
        </h1>
      </motion.div>

      <motion.div
        variants={fadeIn("down", 0.4)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="flex flex-col xl:flex-row justify-center items-center xl:justify-between mb-6"
      >
        <button
          onClick={toggleReverse}
          className="text-accent bg-transparent border border-accent w-[220px] px-4 py-2 rounded-lg hover:bg-accent hover:text-white transition-all duration-200 mb-6 xl:mb-0"
        >
          {isReverse ? "Vezi cursa directa" : "Vezi cursa inversa"}
        </button>
        <button
          onClick={generatePDF}
          className="text-accent bg-transparent border border-accent w-[220px] px-4 py-2 rounded-lg hover:bg-accent hover:text-white transition-all duration-200"
        >
          Salvare tabel format PDF
        </button>
      </motion.div>

      <motion.div
        variants={fadeIn("none", 1)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="hidden xl:block"
      >
        <h1 className="text-center text-xl text-gray-700 mb-6">Traseu:</h1>
        <div className="flex justify-center items-center px-2 gap-x-[50px] gap-y-[60px] flex-wrap">
          {lineObject &&
            stations &&
            stations.map((stop, index) => {
              return (
                <div key={index} className="flex">
                  <Image
                    className="mr-2"
                    src="/station-icon.svg"
                    alt="Station icon"
                    width={20}
                    height={20}
                  ></Image>
                  <p
                    className={
                      stop.stop === currentStation
                        ? "text-accent cursor-pointer hover:text-accent transition-all duration-200"
                        : "text-gray-700 cursor-pointer hover:text-accent transition-all duration-200"
                    }
                    onClick={(e) => {
                      setCurrentStation(stop.stop);
                      setSelectedStationData(stop);
                      const rect = e.target.getBoundingClientRect();
                      const centerX = rect.width / 2;
                      const busElement = document.getElementById("bus");
                      busElement.style.position = "absolute";
                      busElement.style.left = `${rect.left + centerX - 25}px`;
                      busElement.style.top = `${rect.top}px`;
                      busElement.style.marginTop = "15px";
                    }}
                    ref={index === 0 ? firstStopRef : null}
                  >
                    {stop.stop}
                  </p>
                  {index !== stations.length - 1 && (
                    <span className="text-gray-700 ps-8"> → </span>
                  )}
                </div>
              );
            })}
        </div>

        <div className="h-[50px] flex items-center mb-4">
          <div
            id="bus"
            style={{
              position: "absolute",
              transition: "left 0.5s ease-in-out, top 0.5s ease-in-out",
            }}
          >
            <div className="flex flex-col items-center">
              <Image
                className="my-2"
                src="/uparrow-icon.svg"
                alt="Up arrow icon"
                width={15}
                height={15}
              ></Image>
              <Image
                src="/bus-icon.png"
                alt="Bus icon"
                width={50}
                height={50}
              ></Image>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn("down", 0.4)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="md:hidden mb-10 flex justify-center items-center"
      >
        <select
          className="w-[220px] bg-accent border border-accent rounded-lg text-white focus:outline-none h-[40px] text-center"
          onChange={(e) => {
            const selectedStationName = e.target.value;
            const selectedStation = stations.find(
              (station) => station.stop === selectedStationName
            );
            setCurrentStation(selectedStationName);
            setSelectedStationData(selectedStation);
          }}
        >
          {lineObject &&
            stations &&
            stations.map((stop, index) => (
              <option key={index} value={stop.stop}>
                {stop.stop}
              </option>
            ))}
        </select>
      </motion.div>

      <motion.div
        variants={fadeIn("up", 0.6)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="flex justify-between items-center"
      >
        <p className="text-gray-700 text-lg xl:text-2xl">
          Statia: {lineObject ? currentStation : "Loading..."}
        </p>
        <p className="text-gray-700">
          Valabil din:{" "}
          {lineObject ? formatDate(lineObject.validFrom) : "Loading..."}
        </p>
      </motion.div>

      {isMobile ? (
        <MobileTable
          lineObject={lineObject}
          selectedStationData={selectedStationData}
        />
      ) : (
        <DesktopTable
          tableId="pdf-table"
          lineObject={lineObject}
          selectedStationData={selectedStationData}
        />
      )}

      <motion.h1
        variants={fadeIn("up", 0.6)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="my-6 text-lg xl:text-2xl text-gray-700"
      >
        <span className="font-bold">Nota: </span>Respectarea orelor de trecere
        poate fi influentata de conditiile de trafic!
      </motion.h1>
    </section>
  );
};

export default Line;
