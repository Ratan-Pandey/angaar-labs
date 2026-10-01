import { motion } from "framer-motion";
export default function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>
  );
}
