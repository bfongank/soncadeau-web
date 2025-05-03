// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { database } from '../firebase/firebaseConfig';
import { ref, push } from 'firebase/database';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
    country: string;
    category: string;
    starred?: boolean;
    images?: string[];
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { currentUser } = useUser();
  const { formatPrice } = useCurrency();

  const addToWishlist = async () => {
    if (!currentUser) return;
    
    try {
      const wishlistRef = ref(database, `users/${currentUser.uid}/wished products`);
      await push(wishlistRef, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        country: product.country
      });
      alert('Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow relative">
      {product.starred && (
        <div className="badge badge-secondary absolute top-2 right-2">
          Popular
        </div>
      )}
      
      <Link to={`/product/${product.id}`}>
        <figure>
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-48 w-full object-cover" 
          />
        </figure>
        <div className="card-body p-4">
          <h3 className="card-title">{product.name}</h3>
          <p className="text-gray-600 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-pink-600">
            {formatPrice(product.price)}
            </span>
            <span className="badge badge-outline">
              {product.country}
            </span>
          </div>
        </div>
      </Link>
      
      {currentUser && (
        <div className="card-actions p-4 pt-0">
          <button 
            onClick={addToWishlist}
            className="btn btn-sm btn-outline btn-primary w-full"
          >
            Add to Wishlist
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;