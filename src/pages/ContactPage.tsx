import { motion } from 'framer-motion';

const Contact = () => {
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have questions or feedback? We'd love to hear from you!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-8 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
          <form className="space-y-4">
            <motion.div whileHover={{ scale: 1.01 }}>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }}>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }}>
              <textarea
                placeholder="Your Message"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </motion.div>
            <motion.button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <motion.div 
            className="p-6 bg-gray-50 rounded-lg"
            whileHover={{ x: 5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
            <p className="text-gray-600">123 Business Street, City, Country</p>
          </motion.div>

          <motion.div 
            className="p-6 bg-gray-50 rounded-lg"
            whileHover={{ x: 5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600">contact@example.com</p>
          </motion.div>

          <motion.div 
            className="p-6 bg-gray-50 rounded-lg"
            whileHover={{ x: 5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600">+1 (123) 456-7890</p>
          </motion.div>

          <motion.div 
            className="p-6 bg-gray-50 rounded-lg"
            whileHover={{ x: 5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
            <p className="text-gray-600">Monday - Friday: 9am - 5pm</p>
            <p className="text-gray-600">Saturday: 10am - 2pm</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;