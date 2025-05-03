// src/pages/AccountPage.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { database } from '../firebase/firebaseConfig';
import { ref, update } from 'firebase/database';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

const AccountPage = () => {
  const { currentUser, userData } = useUser();
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    surname: userData?.surname || '',
    email: userData?.email || '',
    birthday: userData?.birthday || '',
    country: userData?.country || '',
    street: userData?.street || '',
    town: userData?.town || '',
    zipCode: userData?.zipCode || '',
    mobileNumber: userData?.mobileNumber || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const userRef = ref(database, `users/${currentUser.uid}`);
      await update(userRef, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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

  const editToggleVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 200 }
    }
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold mb-4"
        >
          Mon Compte
        </motion.h2>
        <motion.p variants={itemVariants} className="mb-4">
          Veuillez vous connecter pour accéder à votre compte
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/login" className="btn btn-primary">Connexion</Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-2xl font-bold">Mon Compte</h2>
          <motion.button 
            onClick={handleLogout} 
            className="btn btn-error"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Déconnexion
          </motion.button>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="card bg-base-100 shadow-md p-6"
          whileHover={{ y: -2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Informations Personnelles</h3>
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.button
                  key="edit-button"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={editToggleVariants}
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Modifier
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit}>
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <motion.div variants={itemVariants} className="form-control">
                <label className="label">
                  <span className="label-text">Prénom</span>
                </label>
                {isEditing ? (
                  <motion.input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  />
                ) : (
                  <p>{userData?.name || 'Non renseigné'}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants} className="form-control">
                <label className="label">
                  <span className="label-text">Nom</span>
                </label>
                {isEditing ? (
                  <motion.input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  />
                ) : (
                  <p>{userData?.surname || 'Non renseigné'}</p>
                )}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="form-control mt-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              {isEditing ? (
                <motion.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                />
              ) : (
                <p>{userData?.email || 'Non renseigné'}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="form-control mt-4">
              <label className="label">
                <span className="label-text">Date de Naissance</span>
              </label>
              {isEditing ? (
                <motion.input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="input input-bordered"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                />
              ) : (
                <p>{userData?.birthday || 'Non renseigné'}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="form-control mt-4">
              <label className="label">
                <span className="label-text">Pays</span>
              </label>
              {isEditing ? (
                <motion.select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="select select-bordered"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <option value="Cameroon">Cameroun</option>
                  <option value="France">France</option>
                  <option value="Canada">Canada</option>
                  <option value="USA">États-Unis</option>
                  <option value="Germany">Allemagne</option>
                </motion.select>
              ) : (
                <p>{userData?.country || 'Non renseigné'}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="form-control mt-4">
              <label className="label">
                <span className="label-text">Adresse</span>
              </label>
              {isEditing ? (
                <motion.input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="input input-bordered"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                />
              ) : (
                <p>{userData?.street || 'Non renseigné'}</p>
              )}
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            >
              <motion.div variants={itemVariants} className="form-control">
                <label className="label">
                  <span className="label-text">Ville</span>
                </label>
                {isEditing ? (
                  <motion.input
                    type="text"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    className="input input-bordered"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  />
                ) : (
                  <p>{userData?.town || 'Non renseigné'}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants} className="form-control">
                <label className="label">
                  <span className="label-text">Code Postal</span>
                </label>
                {isEditing ? (
                  <motion.input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="input input-bordered"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  />
                ) : (
                  <p>{userData?.zipCode || 'Non renseigné'}</p>
                )}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="form-control mt-4">
              <label className="label">
                <span className="label-text">Téléphone</span>
              </label>
              {isEditing ? (
                <motion.input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="input input-bordered"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                />
              ) : (
                <p>{userData?.mobileNumber || 'Non renseigné'}</p>
              )}
            </motion.div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-end gap-4 mt-6"
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: userData?.name || '',
                        surname: userData?.surname || '',
                        email: userData?.email || '',
                        birthday: userData?.birthday || '',
                        country: userData?.country || '',
                        street: userData?.street || '',
                        town: userData?.town || '',
                        zipCode: userData?.zipCode || '',
                        mobileNumber: userData?.mobileNumber || '',
                      });
                    }}
                    className="btn btn-error"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Enregistrement...
                      </motion.span>
                    ) : 'Enregistrer'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AccountPage;