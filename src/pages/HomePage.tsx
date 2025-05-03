import { useEffect, useState } from 'react';
import { database } from '../firebase/firebaseConfig';
import { FacebookProvider, Comments, Like } from 'react-facebook';
import { ref, onValue } from 'firebase/database';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    banners: true,
    categories: true,
    products: true
  });

  // Témoignages Facebook
  const [facebookTestimonials] = useState([
    {
      id: 1,
      name: "Jessy Tinanga",
      location: "Paris, France",
      comment: "Expérience incroyable 😍 ! Vous êtes superbes ! Vous avez fait tout ce que je voulais dans les moindres détails. Professionnels, disponibles, et à l'écoute de mes besoins. Je suis très heureuse de vous avoir fait confiance et je ne le regrette pas.",
      imageUrl: "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/28059475_1691928197530076_2838968451251281703_n.jpg"
    },
    {
      id: 2,
      name: "Nelly Wandji",
      location: "Douala, Cameroun",
      comment: "Je suis émerveillée par la qualité d'exécution et le professionnalisme avec lequel ma prestation a été réalisée. Merci beaucoup Son Cadeau !",
      imageUrl: "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/26685876_10204342617242395_7261026629083803201_o.jpg"
    },
    {
      id: 3,
      name: "Bertrand Motchoffo",
      location: "Seattle, USA",
      comment: "Promptitude et patience combinées ! Rapides dans l'exécution avec effet garanti, et patients dans l'écoute des désirs du client. J'ai fait appel à SonCadeau à 3 reprises déjà, et à chaque fois, c'est une nouvelle expérience innovante malgré les délais courts.",
      imageUrl: "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/40406238_1810014545720734_1840733102284996608_n.jpg"
    },
    {
      id: 4,
      name: "Jores de BA",
      location: "Pointe-Noire, Congo",
      comment: "Client satisfait par l'enthousiasme et le sérieux des acteurs du projet, par leurs remarques, conseils et assistance. Chaque cadeau a atteint son objectif.",
      imageUrl: "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/24273887_1965839163432286_2192640463953490974_o.jpg"
    }
  ]);

  // Galerie photos clients
  const [customerPhotos] = useState([
    "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/155406553_1620606598140720_6138579493245828968_n.jpg",
    "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/155302688_154625129815680_5737191345923804152_n.jpg",
    "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/154969745_464614758008176_1108387400120356608_n.jpg",
    "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/141560795_815948472352315_1457204433175815888_n.jpg",
    "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/154783610_792569248285087_895449525820739432_n.jpg",
    "https://cdn.website-editor.net/dced8da0f897401f8b56afdccef143ab/dms3rep/multi/154347018_428889208336851_8990918555008595228_n.jpg"
  ]);

  useEffect(() => {
    // Charger les bannières
    const bannersRef = ref(database, 'Banner');
    onValue(bannersRef, (snapshot) => {
      const data = snapshot.val();
      setBanners(data || []);
      setLoading(prev => ({ ...prev, banners: false }));
    });

    // Charger les catégories
    const categoriesRef = ref(database, 'Category');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data || []);
      setLoading(prev => ({ ...prev, categories: false }));
    });

    // Charger les produits vedettes
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList = Object.values(data).filter((product: any) => product.starred);
      setFeaturedProducts(productList as any[]);
      setLoading(prev => ({ ...prev, products: false }));
    });

    // Charger le SDK Facebook pour les commentaires
    const loadFacebookSDK = () => {
      if (window.FB) return;

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v12.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.nonce = 'YOUR_NONCE_VALUE';
      document.body.appendChild(script);
    };

    loadFacebookSDK();
  }, []);

  if (loading.banners || loading.categories || loading.products) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white">
      {/* Bannière Hero */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex transition-transform duration-500 ease-in-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Replace banners array with your YouTube video ID */}
          <div className="w-full flex-shrink-0">
            <div className="relative h-64 md:h-96 w-full">
              {/* YouTube Video Embed */}
              <iframe
                className="w-full h-full object-cover zoom-in"
                src="https://www.youtube.com/embed/8Gl-95J-VNo?autoplay=1&mute=1&loop=1&playlist=8Gl-95J-VNo&controls=0"
                title="Pub Son Cadeau"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <motion.div
                  className="text-center px-4"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Cadeaux exceptionnels pour vos proches
                  </h2>
                  <Link
                    to="/products"
                    className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Acheter maintenant
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section Catégories */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Nos Catégories</h2>
          <Link
            to="/categories"
            className="flex items-center text-primary hover:text-primary-dark"
          >
            Voir tout <ChevronRightIcon className="h-5 w-5 ml-1" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {categories.map((category, index) => (
            <motion.div key={index} variants={item}>
              <Link
                to={`/category/${category.title.toLowerCase()}`}
                className="group block text-center"
              >
                <motion.div
                  className="relative rounded-lg overflow-hidden aspect-square mb-2"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <img
                    src={category.picUrl}
                    alt={category.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary">
                  {category.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Produits Vedettes */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Produits Vedettes</h2>
          <Link
            to="/products"
            className="flex items-center text-primary hover:text-primary-dark"
          >
            Voir tout <ChevronRightIcon className="h-5 w-5 ml-1" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {product.price} FCFA
                    </span>
                    <button className="text-primary hover:text-primary-dark">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Section Témoignages */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-primary bg-opacity-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ils ont adoré leur expérience Son Cadeau 😍</h2>
          <p className="text-gray-600 mt-2">Des souvenirs précieux partagés</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {facebookTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={item}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <motion.img
                  src={testimonial.imageUrl}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary border-opacity-20"
                  whileHover={{ scale: 1.05 }}
                />
              </div>
              <div className="text-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-gray-600 italic mb-4">"{testimonial.comment}"</p>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Commentaires Facebook */}
        <motion.div
          className="mt-12 bg-white p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-bold text-center mb-6">Laissez votre commentaire</h3>
          <div
            className="fb-comments"
            data-href="https://www.facebook.com/SonCadeau"
            data-width="100%"
            data-numposts="5"
          ></div>
        </motion.div>
      </motion.section>

      {/* Galerie Photos Clients */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Une image vaut mille mots !</h2>
          <p className="text-gray-600 mt-2">Des moments de bonheur partagés</p>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {customerPhotos.map((photo, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group relative overflow-hidden rounded-lg aspect-square"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={photo}
                alt={`Client heureux ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Section Valeurs */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={item} className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                className="bg-primary bg-opacity-10 p-3 rounded-full"
                whileHover={{ rotate: 10 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-lg font-bold mb-2">Produits de Qualité</h3>
            <p className="text-gray-600">Cadeaux sélectionnés avec soin auprès de fournisseurs de confiance</p>
          </motion.div>

          <motion.div variants={item} className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                className="bg-primary bg-opacity-10 p-3 rounded-full"
                whileHover={{ rotate: 10 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-lg font-bold mb-2">Livraison Rapide</h3>
            <p className="text-gray-600">Expédition rapide et fiable jusqu'à votre destinataire</p>
          </motion.div>

          <motion.div variants={item} className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                className="bg-primary bg-opacity-10 p-3 rounded-full"
                whileHover={{ rotate: 10 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-lg font-bold mb-2">Paiement Sécurisé</h3>
            <p className="text-gray-600">Méthodes de paiement 100% sécurisées</p>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default HomePage;