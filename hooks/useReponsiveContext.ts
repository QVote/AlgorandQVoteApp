import { ResponsiveContext } from "grommet";
import { useContext } from "react";

export const useReponsiveContext = () => {
  const responsiveContext = useContext(ResponsiveContext);
  return responsiveContext;
};
