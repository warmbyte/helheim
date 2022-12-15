import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import NiceModal from "@ebay/nice-modal-react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <NiceModal.Provider>
        <Component {...pageProps} />
      </NiceModal.Provider>
    </ChakraProvider>
  );
}
