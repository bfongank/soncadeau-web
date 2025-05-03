// src/pages/CategoryPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState('');

  useEffect(() => {
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and filter by category
        const productList = Object.values(data).filter((product: any) => 
          product.category.toLowerCase() === category?.toLowerCase()
        );
        setProducts(productList as any[]);
        
        // Set category title from the first product (if available)
        if (productList.length > 0) {
          setCategoryTitle((productList[0] as any).category);
        }
      }
      setLoading(false);
    });
  }, [category]);

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold capitalize">{categoryTitle || category}</h1>
        <div className="divider"></div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg">No products found in this category</p>
          <button className="btn btn-primary mt-4">Continue Shopping</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;