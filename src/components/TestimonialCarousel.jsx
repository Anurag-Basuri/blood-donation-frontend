import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const TestimonialCarousel = ({ testimonials }) => {
  return (
    <div className="relative py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: ".testimonial-pagination",
          }}
          navigation={{
            prevEl: ".testimonial-prev",
            nextEl: ".testimonial-next",
          }}
          loop={true}
          className="pb-12"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <TestimonialCard {...testimonial} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation */}
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button className="testimonial-prev p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors">
            <FiChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="testimonial-pagination flex space-x-2"></div>
          <button className="testimonial-next p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors">
            <FiChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TestimonialCard = ({ quote, author, role, avatar, className }) => {
  return (
    <div className={`p-8 flex flex-col h-full ${className}`}>
      <div className="mb-6 text-indigo-500">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 32 32">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
      </div>

      <blockquote className="text-lg md:text-xl text-gray-700 mb-8 flex-grow">
        "{quote}"
      </blockquote>

      <div className="flex items-center">
        <div className="relative">
          <img
            src={avatar}
            alt={`${author}'s avatar`}
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
          />
          <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-gray-900">{author}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
