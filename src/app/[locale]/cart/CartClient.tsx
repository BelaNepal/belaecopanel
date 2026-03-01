'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore, useAuthStore } from '@/stores';
import { orderAPI, quotationAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Trash2, Plus, Minus, ArrowRight, Loader2, ShoppingCart, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartClient() {
  const { items, removeItem, updateQuantity, updateItemNotes, clearCart, totalPrice: getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();
  const { user } = useAuthStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderType, setOrderType] = useState<'quotation' | 'order'>('quotation');
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    setSubmitting(true);
    setError('');

    try {
      const itemsPayload = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        itemNotes: item.itemNotes
      }));

      if (!user) {
        // Guest Checkout
        if (!guestDetails.name || !guestDetails.email || !guestDetails.phone || !guestDetails.address) {
           throw new Error('Please fill in Name, Email, Phone and Address');
        }

        await quotationAPI.createGuest({
          items: itemsPayload,
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          guestAddress: guestDetails.address,
          notes: guestDetails.notes || "Guest Request"
        });
      } else {
        // Authenticated Checkout
        if (orderType === 'quotation') {
          await quotationAPI.create({
            items: itemsPayload,
            notes: "Generated from cart"
          });
        } else {
          // For direct orders (if enabled)
          await orderAPI.create({
            items: itemsPayload,
            shippingAddress: user.address || 'TBD',
            shippingCity: user.city || 'TBD', 
            shippingState: user.state || 'TBD',
            shippingPostal: user.postalCode || 'TBD'
          });
        }
      }

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }

    if (success) {
      setTimeout(() => {
         router.push('/dashboard');
      }, 2000);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-none shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your {orderType === 'quotation' ? 'quotation request' : 'order'} has been submitted successfully. You can track its status in your dashboard.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/dashboard" 
                className="w-full bg-primary text-white font-bold py-3 rounded-none hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/products" 
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-none hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-primary dark:text-white mb-8 flex items-center gap-3">
            <ShoppingCart className="text-secondary" />
            Your Cart ({items.length})
          </h1>

          {items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-none shadow-sm text-center border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <ShoppingCart size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Browse our products to find what you need.
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-secondary text-white font-bold py-3 px-8 rounded-none hover:bg-secondary/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
              >
                Browse Products
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3 space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.productId}
                    className="bg-white dark:bg-gray-800 p-4 rounded-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center"
                  >
                    <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-none overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image 
                          src={getImageUrl(item.imageUrl)} 
                          alt={item.name} 
                          fill
                          sizes="96px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {item.productCode ? `${item.productCode} - ` : ''}{item.name}
                          </h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mt-1">
                            <p>{item.panelType} Panel</p>
                            {(item.thickness || item.length) && (
                              <p className="text-xs">
                                {item.thickness && `${item.thickness}mm Thick`}
                                {item.thickness && item.length && ' • '}
                                {item.length && `${item.length}ft Length`}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-bold text-lg text-primary dark:text-blue-400">
                          Rs. {item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Qty:</span>
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-none">
                            <button 
                              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-medium text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-600 underline"
                >
                  Clear Cart
                </button>
              </div>

              {/* Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-lg border border-gray-100 dark:border-gray-700 sticky top-32">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                      <span>Rs. {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Tax (13% VAT)</span>
                      <span>Rs. {(totalPrice * 0.13).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3 flex justify-between font-bold text-lg text-primary dark:text-white">
                      <span>Total</span>
                      <span>Rs. {(totalPrice * 1.13).toLocaleString()}</span>
                    </div>
                  </div>

                  {!user ? (
                    <div className="mb-6 space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm mb-4 rounded-none border border-blue-100 dark:border-blue-800">
                        Please provide your details to request a quotation. An account will be created for you.
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          value={guestDetails.name}
                          onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          value={guestDetails.email}
                          onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                          placeholder="name@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                        <input 
                          type="tel" 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          value={guestDetails.phone}
                          onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                          placeholder="+977 98..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          rows={2}
                          value={guestDetails.address}
                          onChange={(e) => setGuestDetails({...guestDetails, address: e.target.value})}
                          placeholder="Your complete address"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          rows={2}
                          value={guestDetails.notes}
                          onChange={(e) => setGuestDetails({...guestDetails, notes: e.target.value})}
                          placeholder="Any specific requirements..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Action Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setOrderType('quotation')}
                          className={`py-2 px-3 text-sm font-medium border rounded-none transition-all ${
                            orderType === 'quotation' 
                              ? 'bg-secondary text-white border-secondary' 
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-secondary'
                          }`}
                        >
                          Request Quote
                        </button>
                        <button
                          onClick={() => setOrderType('order')}
                          className={`py-2 px-3 text-sm font-medium border rounded-none transition-all ${
                            orderType === 'order' 
                              ? 'bg-secondary text-white border-secondary' 
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-secondary'
                          }`}
                        >
                          Place Order
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {orderType === 'quotation' 
                          ? 'Get a formal price quotation valid for 15 days.' 
                          : 'Place a direct order for processing.'}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-none border border-red-100">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={submitting || items.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none rounded-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {!user ? 'Request Quotation' : (orderType === 'quotation' ? 'Request Quotation' : 'Checkout Order')}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
