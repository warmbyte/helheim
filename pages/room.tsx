import dynamic from "next/dynamic";
const Call = dynamic(() => import("../components/Call"), {
  ssr: false,
});

const room = () => {
  return <Call />;
};

export default room;
