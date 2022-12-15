import { useState } from "react";

/**
 * this hooks will simplify the integration between
 * async function call with react loading, data, and error state
 * the error will be automatically displayed as toast
 * @param fn async function
 */
export const useAsync = <T, A extends any[]>(
  fn: (...args: A) => Promise<T>
) => {
  const [state, setState] = useState<{
    isLoading: boolean;
    data: null | T;
  }>({
    isLoading: false,
    data: null as T,
  });

  const exec = async (...args: A) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = await fn(...args);
      setState((prev) => ({ ...prev, data }));
      return data as T;
    } catch (error) {
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    return {} as T;
  };

  return { ...state, exec };
};
