'use client';

import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguageStore } from '@/stores';
import { useTranslations } from 'next-intl';
import { productAPI } from '@/lib/api';
import { getImageUrl, createProductSlug } from '@/lib/utils';
import { Filter, Search, ShoppingCart, FileText, ChevronRight, Loader2, X, LayoutGrid, List, ShieldCheck, VolumeX, Flame } from 'lucide-react';
import { Link } from '@/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  panelType: string;
  panelShape: string;
  thickness: number;
  length: number;
  weight: number;
  rateWithVat: number;
  imageUrl: string;
  category: string;
  finishing?: string;
}

export default function ProductsClient() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [filters, setFilters] = useState({
    panelType: '',
    panelShape: '',
    thickness: '',
    length: '',
    finishing: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => {
        if (prev.search === searchTerm) return prev;
        return { ...prev, search: searchTerm };
      });
      if (filters.search !== searchTerm) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters.search]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileFilters]);

  const t = useTranslations('products');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * limit,
        take: limit,
        serviceTag: 'ECOPANELS',
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] === '') {
          delete params[key as keyof typeof params];
        }
      });

      const res = await productAPI.getAll(params);
      setProducts(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      panelType: '',
      panelShape: '',
      thickness: '',
      length: '',
      finishing: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
    setSearchTerm('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      
      {/* Header Section - Updated to match aesthetic design */}
      <section className="relative pt-48 lg:pt-24 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-pattern-hex opacity-10 animate-pattern-slide"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/20 rounded-none blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-none blur-[80px]"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-none bg-white/10 border border-white/20 text-secondary text-sm font-medium mb-4 animate-fade-in-up">
            Our Collection
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100">
            {language === 'en' ? (
              <>Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-300">Eco Panels</span></>
            ) : (
              t('title')
            )}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light animate-fade-in-up delay-200 mb-8">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="min-h-screen bg-gray-50 dark:bg-[var(--color-dark)] py-12 relative z-20 -mt-10">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Mobile Filter Backdrop */}
            {showMobileFilters && (
              <div 
                className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                onClick={() => setShowMobileFilters(false)}
              />
            )}

            {/* Sticky Sidebar Filters */}
            <aside className={`
              lg:w-1/4 lg:block
              ${showMobileFilters ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[90%] max-w-md max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-10' : 'hidden'}
              lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-8 scrollbar-hide
            `}>
              <div className="space-y-6">
                <div className="flex justify-between items-center lg:hidden mb-6 sticky top-0 z-10 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="px-4 py-1.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      OK
                    </button>
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filter By</h3>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Panel Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Panel Type</label>
                    <select 
                      value={filters.panelType}
                      onChange={(e) => handleFilterChange('panelType', e.target.value)}
                      className="w-full p-2.5 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="">All Types</option>
                      <option value="HOLLOW">Hollow</option>
                      <option value="CORE">Core</option>
                    </select>
                  </div>

                  {/* Panel Shape */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Panel Shape</label>
                    <select 
                      value={filters.panelShape}
                      onChange={(e) => handleFilterChange('panelShape', e.target.value)}
                      className="w-full p-2.5 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="">All Shapes</option>
                      <option value="L">L Shape</option>
                      <option value="T">T Shape</option>
                      <option value="BOARD">Board</option>
                    </select>
                  </div>

                  {/* Thickness */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Thickness (mm)</label>
                    <div className="flex flex-wrap gap-2">
                      {['60', '75', '90', '100', '120', '150', '200'].map((th) => (
                        <button
                          key={th}
                          onClick={() => handleFilterChange('thickness', filters.thickness === th ? '' : th)}
                          className={`px-3 py-1.5 text-sm border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-none ${
                            filters.thickness === th
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {th}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Length (mm)</label>
                    <div className="flex flex-wrap gap-2">
                      {['2440', '2700', '3000'].map((len) => (
                        <button
                          key={len}
                          onClick={() => handleFilterChange('length', filters.length === len ? '' : len)}
                          className={`px-3 py-1.5 text-sm border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-none ${
                            filters.length === len
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Finishing Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Finishing Type</label>
                    <select 
                      value={filters.finishing}
                      onChange={(e) => handleFilterChange('finishing', e.target.value)}
                      className="w-full p-2.5 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="">All Finishes</option>
                      <option value="With CSB">With CSB</option>
                      <option value="Without CSB">Without CSB</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>                       
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:w-3/4">
              <div className="sticky top-[4.5rem] z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 rounded-none shadow-lg shadow-gray-200/20 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
                <p className="text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium pl-2">
                  Showing <span className="font-bold text-gray-900 dark:text-white">{products.length}</span> of <span className="font-bold text-gray-900 dark:text-white">{total}</span> products
                </p>

                {/* Search Bar */}
                <div className="flex-1 max-w-md w-full mx-4">
                   <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Search by code, name, or size..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-none border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                   </div>
                </div>
                
                <div className="flex items-center gap-4 pr-2">
                  {/* View Toggle */}
                  <div className="hidden md:flex bg-white dark:bg-gray-800 rounded-none p-1 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-none transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      title="Grid View"
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-none transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      title="List View"
                    >
                      <List size={20} />
                    </button>
                  </div>

                  <button 
                    className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <Filter size={20} />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Mobile Active Filters Badges */}
              <div className="md:hidden flex flex-wrap gap-2 mb-6 px-1 -mt-4">
                {(filters.panelType || filters.panelShape || filters.thickness || filters.length || filters.finishing) && (
                  <>
                    {filters.panelType && (
                      <button 
                        onClick={() => handleFilterChange('panelType', '')}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in zoom-in duration-200"
                      >
                        <span className="text-gray-500">Type:</span> {filters.panelType} <X size={14} className="text-red-500" />
                      </button>
                    )}
                    {filters.panelShape && (
                      <button 
                        onClick={() => handleFilterChange('panelShape', '')}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in zoom-in duration-200"
                      >
                        <span className="text-gray-500">Shape:</span> {filters.panelShape} <X size={14} className="text-red-500" />
                      </button>
                    )}
                    {filters.thickness && (
                      <button 
                        onClick={() => handleFilterChange('thickness', '')}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in zoom-in duration-200"
                      >
                        <span className="text-gray-500">Thick:</span> {filters.thickness}mm <X size={14} className="text-red-500" />
                      </button>
                    )}
                    {filters.length && (
                      <button 
                        onClick={() => handleFilterChange('length', '')}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in zoom-in duration-200"
                      >
                        <span className="text-gray-500">Len:</span> {filters.length}mm <X size={14} className="text-red-500" />
                      </button>
                    )}
                    {filters.finishing && (
                      <button 
                        onClick={() => handleFilterChange('finishing', '')}
                        className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in zoom-in duration-200"
                      >
                        {filters.finishing} <X size={14} className="text-red-500" />
                      </button>
                    )}
                    <button 
                      onClick={clearFilters}
                      className="text-xs font-medium text-red-500 underline ml-1"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-none border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-none flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Products Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
                  <button 
                    onClick={clearFilters}
                    className="mt-4 text-primary font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'} mb-8`}>
                    {products.map((product) => (
                      <Link 
                        href={`/products/${createProductSlug(product.name, product.id)}`}
                        key={product.id}
                        className={`group bg-white dark:bg-gray-800 rounded-none overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center'} cursor-pointer`}
                      >
                        <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700 ${viewMode === 'grid' ? 'h-48 w-full' : 'h-32 w-32 flex-shrink-0'}`}>
                          {product.imageUrl ? (
                            <Image
                              src={getImageUrl(product.imageUrl)} 
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          {viewMode === 'grid' && (
                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-none text-xs font-bold text-primary">
                              {product.panelType}
                            </div>
                          )}
                        </div>
                        
                        <div className={`p-5 flex-grow flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
                          <div className={`${viewMode === 'grid' ? 'mb-4 flex-grow' : 'mb-2'}`}>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              {viewMode === 'list' && (
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-none text-xs font-bold text-primary">
                                  {product.panelType}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                              {product.description || 'High quality eco panel for sustainable construction.'}
                            </p>
                            
                            {/* Product Characteristics Badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <div className="flex items-center gap-1 text-[10px] font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-none border border-orange-100 dark:border-orange-800">
                                <Flame size={12} />
                                <span>Fire Resistant</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-none border border-blue-100 dark:border-blue-800">
                                <VolumeX size={12} />
                                <span>Sound Proof</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-none border border-green-100 dark:border-green-800">
                                <ShieldCheck size={12} />
                                <span>Durable/Earthquake Resistant</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                              <div className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-none">
                                <span className="font-semibold">Thick:</span> {product.thickness}mm
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-none">
                                <span className="font-semibold">Len:</span> {product.length}mm
                              </div>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'pt-4 border-t border-gray-100 dark:border-gray-700' : 'mt-2'}`}>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">Price</span>
                              <span className="font-bold text-lg text-primary">
                                NPR {product.rateWithVat.toLocaleString()}
                              </span>
                            </div>
                            <span 
                              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 rounded-none"
                            >
                              <ChevronRight size={20} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-none"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-none ${
                            page === p
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-none"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

