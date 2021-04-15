import { MainFrameContext } from "../components/MainFrame";
import { useContext } from "react";

export const useMainContext = () => {
  const mainContext = useContext(MainFrameContext);
  return mainContext;
};
