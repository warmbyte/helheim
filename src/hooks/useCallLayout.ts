import { useMemo } from "react";

export const useCallLayout = (amount: number) => {
  return useMemo(() => {
    let columns = "repeat(3, 1fr)";
    let rows = "repeat(3, 1fr)";

    switch (amount) {
      case 1: {
        columns = rows = "1fr";
        break;
      }
      case 2: {
        rows = "1fr";
        columns = "repeat(2, 1fr)";
        break;
      }
      case 3:
      case 4: {
        columns = "repeat(2, 1fr)";
        rows = "repeat(2, 1fr)";
        break;
      }
      case 5:
      case 6: {
        columns = "repeat(3, 1fr)";
        rows = "repeat(2, 1fr)";
        break;
      }
    }

    return { columns, rows };
  }, [amount]);
};
