import { useEffect, useRef } from "react";

const useClickOutside = (showPopup: boolean, setShowPopup: Function) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (showPopup && ref.current && !ref.current.contains(e.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showPopup]);

  return {
    ref,
  };
};

export default useClickOutside;
