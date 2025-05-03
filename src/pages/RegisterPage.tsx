// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, database } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    city: '',
    street: '',
    country: '',
    phone: '',
    birthday: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.phone && !/^[\d\s+-]+$/.test(formData.phone)) {
        throw new Error('Veuillez entrer un numéro de téléphone valide');
      }

      if (formData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
        throw new Error('Veuillez entrer la date au format AAAA-MM-JJ');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      await set(ref(database, `users/${user.uid}`), {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        city: formData.city,
        street: formData.street,
        country: formData.country,
        phone: formData.phone,
        birthday: formData.birthday,
        createdAt: new Date().toISOString(),
        role: 'client'
      });

      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const displayName = user.displayName || '';
      
      await set(ref(database, `users/${user.uid}`), {
        name: displayName.trim().split(' ')[0] || '',
        surname: displayName.trim().split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        createdAt: new Date().toISOString()
      });

      navigate('/profile/edit');
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const errorVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
      >
        <motion.div variants={itemVariants}>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un nouveau compte
          </h2>
        </motion.div>

        {error && (
          <motion.div 
            variants={errorVariants}
            className="alert alert-error shadow-lg"
          >
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 mx-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <label>{error}</label>
            </div>
          </motion.div>
        )}

        <motion.form 
          variants={containerVariants}
          className="mt-8 space-y-4" 
          onSubmit={handleSubmit}
        >
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                required
                className="input input-bordered w-full"
                placeholder="Prénom"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                autoComplete="family-name"
                required
                className="input input-bordered w-full"
                placeholder="Nom"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input input-bordered w-full"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="input input-bordered w-full"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                required
                className="input input-bordered w-full"
                placeholder="Ville"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <select
                id="country"
                name="country"
                autoComplete="country"
                required
                className="select select-bordered w-full"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Sélectionnez un pays</option>
                <option value="Cameroon">Cameroun</option>
                <option value="France">France</option>
                <option value="USA">États-Unis</option>
                <option value="Germany">Allemagne</option>
              </select>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              id="street"
              name="street"
              type="text"
              autoComplete="street-address"
              required
              className="input input-bordered w-full"
              placeholder="Rue et numéro"
              value={formData.street}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="input input-bordered w-full"
                placeholder="+237 6XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                required
                className="input input-bordered w-full"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="pt-4"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </motion.div>
        </motion.form>

        <motion.div 
          variants={itemVariants}
          className="divider text-center"
        >
          OU
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <button
            onClick={handleGoogleRegister}
            className="btn btn-outline w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            S'inscrire avec Google
          </button>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="text-center pt-4"
        >
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link 
              to="/login" 
              className="font-medium text-pink-600 hover:text-pink-500"
            >
              Se connecter
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;