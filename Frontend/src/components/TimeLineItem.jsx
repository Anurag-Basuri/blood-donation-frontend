import { motion } from 'framer-motion';

const TimelineItem = ({ year, title, description }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="timeline-item"
  >
    <div className="timeline-dot" />
    <div className="timeline-content">
      <h3>{year}</h3>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </motion.div>
);

export default TimelineItem;
