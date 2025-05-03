import { motion } from 'framer-motion';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-8"
        >
          Our Story
        </motion.h1>

        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h2 
              className="text-2xl font-semibold mb-4"
              whileHover={{ scale: 1.02 }}
            >
              Who We Are
            </motion.h2>
            <motion.p className="text-gray-600">
              We started as a small team passionate about delivering quality products with exceptional 
              customer service. Our journey began in 2015 and we've been growing ever since.
            </motion.p>
          </div>
          <motion.div
            className="h-64 bg-gray-200 rounded-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          ></motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            className="h-64 bg-gray-200 rounded-lg order-last md:order-first"
            whileHover={{ scale: 1.01 }}
          ></motion.div>
          <div>
            <motion.h2 
              className="text-2xl font-semibold mb-4"
              whileHover={{ scale: 1.02 }}
            >
              Our Mission
            </motion.h2>
            <motion.p className="text-gray-600">
              To create products that make life easier while maintaining sustainable practices 
              and giving back to our community.
            </motion.p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12">
          <motion.h2 
            className="text-2xl font-semibold mb-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            Meet The Team
          </motion.h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="bg-white p-6 rounded-lg shadow-md text-center"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full mb-4"></div>
                <h3 className="font-medium text-lg">Team Member {item}</h3>
                <p className="text-gray-500">Position</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default About;