import { useEffect, useState } from "react";
import { Id, toast } from "react-toastify";

const useStepsToaster = (
  actionName: string,
  isSuccess: boolean,
  isLoading: boolean,
  isError: boolean
) => {
  const [toastId, setToastId] = useState<Id | null>(null);

  useEffect(() => {
    if (isLoading) {
      let toastvalue = toast.loading("PROCESSING...", {
        position: toast.POSITION.TOP_CENTER,
      });
      setToastId(toastvalue);
    } else if (isSuccess && toastId) {
      toast.update(toastId, {
        render: `${actionName} SUCCESS`,
        type: "success",
        isLoading: false,
        className: "rotateY animated",
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    } else if (isError && toastId) {
      toast.update(toastId, {
        render: `${actionName} ERROR`,
        type: "error",
        isLoading: false,
        className: "rotateY animated",
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }
  }, [isSuccess, isLoading, isError]);
};

export default useStepsToaster;
