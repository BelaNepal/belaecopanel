'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from '@/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore, useCartStore } from '@/stores';
import { 
  Loader2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  CheckCircle, 
  Ruler, 
  Scale, 
  Maximize, 
  Layers, 
  Info,
  ChevronRight,
  Home
} from 'lucide-react';
import { Link } from '@/navigation';

export interface Product {
  id: string;
  productCode?: string;
  name: string;
  description: string;
  panelType: string;
  panelShape: string;
  thickness: number;
  length: number;
  width: number;
  weight: number;
  sqft: number;
  rateWithVat: number;
  imageUrl: string;
  category: string;
  finishing?: string;
}

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('specs');

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      price: product.rateWithVat,
      quantity: quantity,
      imageUrl: product.imageUrl,
      panelType: product.panelType,
      thickness: product.thickness,
      length: product.length,
      finishing: product.finishing
    });

    const canPlaceOrder = ['DEALER', 'ADMIN', 'STAFF'].includes(user?.role);
    const action = canPlaceOrder ? 'Order' : 'Quote';
    setSuccess(`Added to ${action} successfully!`);
    setTimeout(() => {
      setSuccess('');
      router.push('/cart');
    }, 1500);
  };

  if (!product) return null;

  const totalPrice = product.rateWithVat * quantity;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-[var(--color-dark)] pb-20">
        
        {/* Modern Header Section */}
        <div className="bg-gray-50 dark:bg-gray-900/50 pt-2 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="container-custom">
             <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link href="/" className="hover:text-primary transition-colors"><Home size={16} /></Link>
              <ChevronRight size={16} />
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <ChevronRight size={16} />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                   <span className="bg-secondary/10 text-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none">
                     {product.panelType} Panel
                   </span>
                   {product.category && (
                     <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none">
                        {product.category}
                     </span>
                   )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {product.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Image & Details */}
            <div className="lg:col-span-8 space-y-12">
              
               {/* Product Image Section */}
               <div className="relative w-full aspect-[4/3] overflow-hidden shadow-xl rounded-none group bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-700">
                {product.imageUrl ? (
                  <Image 
                    src={getImageUrl(product.imageUrl)} 
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
                
                {/* Floating Image Badges */}
                <div className="absolute bottom-6 left-6 flex gap-4">
                    {product.finishing && (
                      <div className="flex items-center gap-2 text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-none border border-white/10">
                          <CheckCircle size={16} />
                          <span className="font-semibold text-sm">{product.finishing}</span>
                      </div>
                    )}
                </div>
               </div>

               {/* Description */}
               <section>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Info className="text-secondary" size={24} /> Product Overview
                  </h3>
                  <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                     <p className="text-xl leading-relaxed font-light">{product.description || 'Premium quality eco-friendly panel designed for modern construction needs. Features excellent insulation properties, durability, and sustainable materials.'}</p>
                  </div>
               </section>

               {/* Modern Stats Grid */}
               <section>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-secondary/50 transition-colors group">
                       <Ruler className="text-gray-400 group-hover:text-secondary mb-3" size={24} />
                       <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{product.thickness}mm</div>
                       <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thickness</div>
                    </div>
                    <div className="p-5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-secondary/50 transition-colors group">
                       <Scale className="text-gray-400 group-hover:text-secondary mb-3" size={24} />
                       <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{product.weight} kg</div>
                       <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weight</div>
                    </div>
                    <div className="p-5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-secondary/50 transition-colors group">
                       <Maximize className="text-gray-400 group-hover:text-secondary mb-3" size={24} />
                       <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{product.length}mm</div>
                       <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Length</div>
                    </div>
                     <div className="p-5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-secondary/50 transition-colors group">
                       <Layers className="text-gray-400 group-hover:text-secondary mb-3" size={24} />
                       <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{product.sqft}</div>
                       <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sq. Ft.</div>
                    </div>
                  </div>
               </section>

               {/* Tabs Section */}
               <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                   <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex px-6 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('specs')}
                        className={`py-4 px-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'specs' 
                            ? 'border-secondary text-primary dark:text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Technical Details
                      </button>
                      <button
                        onClick={() => setActiveTab('desc')}
                        className={`py-4 px-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'desc' 
                            ? 'border-secondary text-primary dark:text-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Description
                      </button>
                    </div>
                  </div>

                  <div className="p-8">
                    {activeTab === 'specs' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                             Dimensions & Weight
                          </h3>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Length</span>
                            <span className="font-mono text-gray-900 dark:text-white">{product.length} mm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Width</span>
                            <span className="font-mono text-gray-900 dark:text-white">{product.width} ft</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Thickness</span>
                            <span className="font-mono text-gray-900 dark:text-white">{product.thickness} mm</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Weight</span>
                            <span className="font-mono text-gray-900 dark:text-white">{product.weight} kg</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Coverage</span>
                            <span className="font-mono text-gray-900 dark:text-white">{product.sqft} sq.ft</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                             General Info
                          </h3>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Code</span>
                            <span className="font-mono text-gray-900 dark:text-white text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-none">{product.productCode || product.id.substring(0, 8)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Category</span>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{product.category || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Type</span>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{product.panelType}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Shape</span>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{product.panelShape}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'desc' && (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {product.description || 'No detailed description available for this product.'}
                        </p>
                      </div>
                    )}
                  </div>
               </section>
            </div>

            {/* Right Column: Sticky Purchase Card */}
            <div className="lg:col-span-4">
               <div className="sticky top-28 space-y-6">
                  {/* Purchase Card */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-6 md:p-8">
                      <div className="mb-6">
                         <span className="text-sm text-gray-500 uppercase tracking-widest font-bold">Price</span>
                         <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">NPR {totalPrice.toLocaleString()}</span>
                            {quantity > 1 && <span className="text-sm text-gray-400 font-medium">/ {quantity} units</span>}
                         </div>
                         <p className="text-xs text-gray-500 mt-2">Inclusive of all taxes. Shipping calculated at checkout.</p>
                      </div>

                      <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Quantity</label>
                            <div className="flex items-center border border-gray-300 dark:border-gray-600">
                               <button 
                                 onClick={() => handleQuantityChange(-1)}
                                 className="w-14 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                               >
                                 <Minus size={16} />
                               </button>
                               <div className="flex-1 h-12 flex items-center justify-center font-bold text-lg border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                 {quantity}
                               </div>
                               <button 
                                 onClick={() => handleQuantityChange(1)}
                                 className="w-14 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                               >
                                 <Plus size={16} />
                               </button>
                            </div>
                         </div>

                         {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm border-l-4 border-red-500">
                               {error}
                            </div>
                         )}

                         {success && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 text-sm border-l-4 border-green-500">
                               {success}
                            </div>
                         )}

                         <button
                            onClick={handleAddToCart}
                            disabled={submitting}
                            className="w-full py-4 bg-secondary text-white font-bold text-lg hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-3 uppercase tracking-wider"
                         >
                            {submitting ? <Loader2 className="animate-spin" /> : <ShoppingCart size={20} />}
                            {['DEALER', 'ADMIN', 'STAFF'].includes(user?.role) ? 'Add to Order' : 'Add to Quote'}
                         </button>
                         
                         <div className="text-center">
                            <p className="text-xs text-gray-400">Secure checkout powered by Bela Eco Panels</p>
                         </div>
                      </div>
                  </div>

                  {/* Contact / Help Box */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 flex items-start gap-4">
                      <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm text-primary">
                         <Info size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-1">Need Estimation?</h4>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Not sure how many panels you need? Our engineers can help you calculate.</p>
                         <Link href="/contact" className="text-primary font-bold text-sm hover:underline">Contact Support &rarr;</Link>
                      </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
