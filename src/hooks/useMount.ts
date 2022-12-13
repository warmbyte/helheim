import { useEffect, useRef } from "react";
import _debounce from "lodash/debounce";

export const useMount = (cb: () => any) => {
  const cbRef = useRef(_debounce(cb, 100));

  useEffect(() => {
    return cbRef.current();
  }, []);
};
