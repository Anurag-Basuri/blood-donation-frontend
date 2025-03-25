import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";

const TestimonialCarousel = ({ testimonials }) => (
  <Swiper
    spaceBetween={30}
    slidesPerView={1}
    breakpoints={{
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }}
    autoplay={{ delay: 5000 }}
    className="py-12"
  >
    {testimonials.map((testimonial, index) => (
      <SwiperSlide key={index}>
        <TestimonialCard {...testimonial} />
      </SwiperSlide>
    ))}
  </Swiper>
);

export default TestimonialCarousel;
