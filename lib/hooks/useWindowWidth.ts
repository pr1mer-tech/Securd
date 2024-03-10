"use client";
import { useEffect, useState } from "react";

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    function handleWindowResize() {
      typeof window !== "undefined" && setWindowWidth(window.innerWidth);
    }
    handleWindowResize();
    typeof window !== "undefined" &&
      window.addEventListener("resize", handleWindowResize);

    return () => {
      typeof window !== "undefined" &&
        window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return {
    windowWidth,
  };
};

export default useWindowWidth;
