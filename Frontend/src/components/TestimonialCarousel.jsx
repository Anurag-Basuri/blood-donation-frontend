import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

// Import required Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const TestimonialCard = ({ quote, author, role, avatar, className }) => {
  return (
    <motion.div
      className={`p-8 flex flex-col h-full ${className}`}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="mb-6 text-red-500 dark:text-red-400">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 32 32">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
      </div>

      <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-8 flex-grow leading-relaxed">
        "{quote}"
      </blockquote>

      <div className="flex items-center mt-auto">
        <div className="relative">
          <motion.img
            src={avatar}
            alt={`${author}'s avatar`}
            className="w-12 h-12 rounded-full object-cover border-2 border-red-100 dark:border-gray-600"
            whileHover={{ rotate: 5 }}
            transition={{ type: 'spring' }}
          />
          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 flex items-center justify-center">
            <FiCheck className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">{author}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialCarousel = ({ testimonials }) => {
  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={32}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1.1, spaceBetween: 24 },
          768: { slidesPerView: 1.3, spaceBetween: 32 },
          1024: { slidesPerView: 1.8, spaceBetween: 40 },
          1280: { slidesPerView: 2.2, spaceBetween: 48 },
        }}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: (index, className) => {
            return `<span class="${className} bg-red-300 dark:bg-red-400 opacity-50 hover:opacity-100 transition-opacity"></span>`;
          },
        }}
        navigation={{
          nextEl: '.testimonial-next',
          prevEl: '.testimonial-prev',
        }}
        className="!pb-12 !overflow-visible"
      >
        <AnimatePresence initial={false}>
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <TestimonialCard
                {...testimonial}
                className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl h-full border border-gray-100 dark:border-gray-600 hover:border-red-100 dark:hover:border-red-400/50 transition-all"
              />
            </SwiperSlide>
          ))}
        </AnimatePresence>
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          className="testimonial-prev p-3 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-red-600 dark:text-red-300 hover:text-red-800"
          aria-label="Previous testimonial"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <div className="swiper-pagination !relative !w-auto"></div>
        <button
          className="testimonial-next p-3 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-red-600 dark:text-red-300 hover:text-red-800"
          aria-label="Next testimonial"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
