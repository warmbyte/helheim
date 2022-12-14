/* eslint-disable react-hooks/rules-of-hooks */
import dynamic from "next/dynamic";
import Head from "next/head";
const Call = dynamic(() => import("../components/CallNext"), {
  ssr: false,
});

const room = () => {
  return (
    <>
      <Head>
        <title>Yuk Ngumpul Disini</title>
      </Head>
      <Call room="random" />
    </>
  );
};

export default room;
