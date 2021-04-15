import { ResponsiveContext } from "grommet";
import { useContext } from "react";

export const useResponsiveContext = () => {
  const responsiveContext = useContext(ResponsiveContext);
  return responsiveContext;
};
