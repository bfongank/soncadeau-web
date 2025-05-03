import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4"
    >
      <motion.h1 
        className="text-6xl font-bold text-gray-800 mb-4"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        404
      </motion.h1>
      
      <motion.p
        className="text-xl text-gray-600 mb-8"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        Oups! Page non existante.
      </motion.p>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Retourner a l'accueil
        </Link>
      </motion.div>
    </motion.div>
  );
}