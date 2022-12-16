/* eslint-disable react-hooks/rules-of-hooks */
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
const Call = dynamic(() => import("../components/CallNext"), {
  ssr: false,
});

const room = () => {
  const router = useRouter();
  const room = (router.query.room || "random") as string;
  return (
    <>
      <Head>
        <title>Yuk Ngumpul Disini</title>
      </Head>
      <Call room={room} />
    </>
  );
};

export default room;
