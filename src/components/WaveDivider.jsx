import { motion } from "framer-motion";

const WaveDivider = () => (
  <svg
    className="absolute bottom-0 left-0 right-0 text-white"
    viewBox="0 0 1440 120"
  >
    <path
      fill="currentColor"
      d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
    />
  </svg>
);

export default WaveDivider;
