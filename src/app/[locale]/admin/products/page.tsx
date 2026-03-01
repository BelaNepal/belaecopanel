'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, Package, ChevronLeft, ChevronRight, Upload, Download, FileSpreadsheet, FileDown, FileUp, Loader2, Eye } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const LoadingOverlay = ({ message = 'Processing...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-none shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-secondary border-b-transparent border-r-transparent rounded-full animate-spin [animation-direction:reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary dark:text-white animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Please Wait</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  </div>
);

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

interface Product {
  id: string;
  productCode?: string;
  name: string;
  panelType: string;
  panelShape: string;
  thickness: number;
  length: number;
  rateWithVat: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  width?: number;
  weight?: number;
  category?: string;
  sqft?: number;
  thicknessFt?: number;
  lengthFt?: number;
  finishing?: string;
  // Modular Home Fields
  slug?: string;
  modularHome?: {
    homeCode: string;
    homeType: string;
    projectType: string;
    totalBuiltUpArea: number;
    totalBuildArea: number;
    numberOfStories: number;
    bedroomCount: number;
    bathroomCount: number;
    kitchenCount: number;
    livingHallCount: number;
    diningCount: number;
    doorCount: number;
    windowCount: number;
    ventCount: number;
    hasWorshipRoom: boolean;
    hasBalcony: boolean;
    hasStoreRoom: boolean;
    hasParking: boolean;
    estimatedPrice: number;
    pricePerSqft: number;
    pricingNote: string;
    thumbnailUrl?: string;
    image3DUrl?: string;
    image2DUrl?: string;
    conceptPlanUrl?: string;
    documents?: any[];
  };
}

interface FormData {
  productCode: string;
  name: string;
  description: string;
  panelType: string;
  panelShape: string;
  thickness: number;
  length: number;
  width: number; // W1
  weight: number;
  sqft: number;
  rateWithVat: number;
  discount: number;
  specialOffer: number;
  category: string;
  isActive: boolean;
  imageUrl: string;
  thicknessFt: number; // W2
  lengthFt: number;    // L
  finishing: string;
  
  // Modular Home Specifics
  homeCode?: string;
  homeType?: string;
  projectType?: string;
  totalBuiltUpArea?: number;
  totalBuildArea?: number;
  numberOfStories?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  kitchenCount?: number;
  livingHallCount?: number;
  diningCount?: number;
  doorCount?: number;
  windowCount?: number;
  ventCount?: number;
  hasWorshipRoom?: boolean;
  hasBalcony?: boolean;
  hasStoreRoom?: boolean;
  hasParking?: boolean;
  estimatedPrice?: number;
  pricePerSqft?: number;
  pricingNote?: string;
  thumbnailUrl?: string;
  image3DUrl?: string;
  image2DUrl?: string;
  conceptPlanUrl?: string;
  documents?: { title: string; url: string; type: string }[];
}

export default function ProductsAdmin() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [formTab, setFormTab] = useState('basic');

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    productCode: '',
    name: '',
    description: '',
    panelType: 'CORE',
    panelShape: 'L',
    thickness: 100,
    length: 2440,
    width: 4,
    weight: 25,
    sqft: 0,
    rateWithVat: 1000,
    discount: 0,
    specialOffer: 0,
    category: '',
    isActive: true,
    imageUrl: '',
    thicknessFt: 0,
    lengthFt: 0,
    finishing: 'Without CSB',
    
    // Modular Home Defaults
    homeCode: '',
    homeType: 'PORTABLE',
    projectType: 'RESIDENTIAL',
    totalBuiltUpArea: 0,
    totalBuildArea: 0,
    numberOfStories: 1,
    bedroomCount: 0,
    bathroomCount: 0,
    kitchenCount: 0,
    livingHallCount: 0,
    diningCount: 0,
    doorCount: 0,
    windowCount: 0,
    ventCount: 0,
    hasWorshipRoom: false,
    hasBalcony: false,
    hasStoreRoom: false,
    hasParking: false,
    estimatedPrice: 0,
    pricePerSqft: 0,
    pricingNote: ''
  });

  // Auto-calculate SQFT
  useEffect(() => {
    const { width, thicknessFt, lengthFt } = formData;
    // Allow calculation even if width or thicknessFt is 0
    const w1 = width || 0;
    const w2 = thicknessFt || 0;
    const l = lengthFt || 0;

    const calculatedSqft = (w1 + w2) * l;
    setFormData(prev => ({ ...prev, sqft: parseFloat(calculatedSqft.toFixed(4)) }));
  }, [formData.width, formData.thicknessFt, formData.lengthFt]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF' && user?.role !== 'DEALER')) {
      router.push('/admin/login');
      return;
    }

    fetchProducts();
  }, [token, user, router, mounted, page, activeVertical]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (page - 1) * limit;
      const params: any = { skip, take: limit };

      let url = `${API_URL}/products`;
      if (activeVertical === 'MODULARHOMES') {
        url = `${API_URL}/v1/modular-homes`;
      } else {
        // Eco Panels specific params: Filter only ECOPANELS
        params.serviceTag = 'ECOPANELS';
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Excel Import/Export State
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const template = [
      {
        productCode: 'P001',
        name: 'Example Panel',
        description: 'Description here',
        panelType: 'CORE',
        panelShape: 'L',
        thickness: 100,
        length: 2440,
        width: 4,
        weight: 25,
        rateWithVat: 1000,
        discount: 0,
        specialOffer: 0,
        category: 'Category',
        isActive: true,
        imageUrl: '',
        thicknessFt: 0,
        lengthFt: 0,
        finishing: 'Without CSB'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'product_import_template.xlsx');
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await axios.get(`${API_URL}/products?take=10000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsToExport = res.data.data || [];
      
      const ws = XLSX.utils.json_to_sheet(productsToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export products');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      validateAndPreview(data);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const validateAndPreview = (data: any[]) => {
    const errors: any[] = [];
    const validatedData = data.map((row, index) => {
      const rowErrors: string[] = [];
      if (!row.name) rowErrors.push('Name is required');
      if (!row.panelType) rowErrors.push('Panel Type is required');
      
      if (rowErrors.length > 0) {
        errors.push({ row: index + 1, errors: rowErrors });
      }
      return { ...row, _errors: rowErrors };
    });

    setExcelData(validatedData);
    setValidationErrors(errors);
    setShowExcelPreview(true);
  };

  const handleImportConfirm = async () => {
    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of excelData) {
      if (item._errors && item._errors.length > 0) {
        failCount++;
        continue;
      }

      try {
        const { _errors, id, createdAt, updatedAt, ...productData } = item;
        const payload = {
          ...productData,
          thickness: Number(productData.thickness) || 0,
          length: Number(productData.length) || 0,
          width: Number(productData.width) || 0,
          weight: Number(productData.weight) || 0,
          rateWithVat: Number(productData.rateWithVat) || 0,
          sqft: Number(productData.sqft) || ((Number(productData.width) + Number(productData.thicknessFt)) * Number(productData.lengthFt)) || 0,
          isActive: productData.isActive === 'true' || productData.isActive === true
        };

        await axios.post(`${API_URL}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        successCount++;
      } catch (err) {
        console.error('Import error:', err);
        failCount++;
      }
    }

    setSubmitting(false);
    setShowExcelPreview(false);
    setExcelData([]);
    setSuccess(`Import completed: ${successCount} succeeded, ${failCount} failed`);
    fetchProducts();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedImage);

        try {
          const uploadRes = await axios.post(`${API_URL}/upload`, uploadFormData, {
            headers: { 
              Authorization: `Bearer ${token}`
            },
            params: { folder: 'products' }
          });
          imageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          setError('Failed to upload image');
          setSubmitting(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      let productData: any = { 
        ...formData, 
        imageUrl,
        productCode: formData.productCode?.trim() || null,
        description: formData.description?.trim() || null,
        isActive: formData.isActive,
      };

      if (activeVertical === 'MODULARHOMES') {
        // Modular Home Payload Construction
        productData = {
          name: formData.name,
          productCode: formData.productCode, // Use as internal ID
          description: formData.description,
          imageUrl,
          isActive: formData.isActive,
          category: 'Modular Home',
          serviceTag: 'MODULARHOMES',
          
          // Dummy values for required Eco Panel fields
          panelType: 'ALL',
          panelShape: 'BOARD',
          thickness: 0,
          length: 0,
          width: 0,
          weight: 0,
          sqft: formData.totalBuiltUpArea || 0,
          rateWithVat: formData.estimatedPrice || 0,
          
          // Nested Modular Home Data
          modularHome: {
            create: {
              homeCode: formData.homeCode,
              homeType: formData.homeType,
              projectType: formData.projectType,
              totalBuiltUpArea: Number(formData.totalBuiltUpArea) || 0,
              totalBuildArea: Number(formData.totalBuildArea) || 0,
              numberOfStories: Number(formData.numberOfStories) || 1,
              bedroomCount: Number(formData.bedroomCount) || 0,
              bathroomCount: Number(formData.bathroomCount) || 0,
              kitchenCount: Number(formData.kitchenCount) || 0,
              livingHallCount: Number(formData.livingHallCount) || 0,
              diningCount: Number(formData.diningCount) || 0,
              doorCount: Number(formData.doorCount) || 0,
              windowCount: Number(formData.windowCount) || 0,
              ventCount: Number(formData.ventCount) || 0,
              hasWorshipRoom: Boolean(formData.hasWorshipRoom),
              hasBalcony: Boolean(formData.hasBalcony),
              hasStoreRoom: Boolean(formData.hasStoreRoom),
              hasParking: Boolean(formData.hasParking),
              estimatedPrice: Number(formData.estimatedPrice) || 0,
              pricePerSqft: Number(formData.pricePerSqft) || 0,
              pricingNote: formData.pricingNote,
              thumbnailUrl: formData.thumbnailUrl,
              image3DUrl: formData.image3DUrl,
              image2DUrl: formData.image2DUrl,
              conceptPlanUrl: formData.conceptPlanUrl,
              documents: formData.documents
            }
          }
        };

        // If updating, we need to handle the nested update differently
        if (editingId) {
           // For update, we use 'update' instead of 'create'
           // But Prisma update syntax is slightly different depending on if the relation exists
           // For simplicity, we assume it exists if we are editing a Modular Home
           productData.modularHome = {
             update: productData.modularHome.create
           };
        }

      } else {
        // Eco Panel Payload (Existing Logic)
        productData = {
          ...productData,
          thickness: Number(formData.thickness) || 0,
          length: Number(formData.length) || 0,
          width: Number(formData.width) || 0,
          weight: Number(formData.weight) || 0,
          sqft: Number(formData.sqft) || 0,
          rateWithVat: Number(formData.rateWithVat) || 0,
          thicknessFt: Number(formData.thicknessFt) || 0,
          lengthFt: Number(formData.lengthFt) || 0,
          serviceTag: 'ECOPANELS'
        };
      }

      const endpoint = editingId 
        ? `${API_URL}/products/${editingId}` 
        : `${API_URL}/products`;
      
      const method = editingId ? 'patch' : 'post';
      
      await axios[method](endpoint, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(editingId ? 'Product updated successfully' : 'Product created successfully');
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setFormData({
      productCode: '',
      name: '',
      description: '',
      panelType: 'CORE',
      panelShape: 'L',
      thickness: 100,
      length: 2440,
      width: 4,
      weight: 25,
      sqft: 0,
      rateWithVat: 1000,
      discount: 0,
      specialOffer: 0,
      category: '',
      isActive: true,
      imageUrl: '',
      thicknessFt: 0,
      lengthFt: 0,
      finishing: 'Without CSB',
    });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setSelectedImage(null);
    
    const baseData = {
      productCode: product.productCode || '',
      name: product.name,
      description: product.description || '',
      panelType: product.panelType,
      panelShape: product.panelShape,
      thickness: product.thickness,
      length: product.length,
      width: product.width || 0,
      weight: product.weight || 0,
      sqft: product.sqft || 0,
      rateWithVat: product.rateWithVat,
      discount: 0,
      specialOffer: 0,
      category: product.category || '',
      isActive: product.isActive !== undefined ? product.isActive : true, // Explicitly handle boolean default
      imageUrl: product.imageUrl || '',
      thicknessFt: product.thicknessFt || 0,
      lengthFt: product.lengthFt || 0,
      finishing: product.finishing || 'Without CSB',
    };

    if (activeVertical === 'MODULARHOMES' && product.modularHome) {
      setFormData({
        ...baseData,
        // Populate Modular Home Fields - defaulting all to safe values to avoid uncontrolled input warnings
        homeCode: product.modularHome.homeCode || '',
        homeType: product.modularHome.homeType || 'CUSTOM',
        projectType: product.modularHome.projectType || 'OTHER',
        totalBuiltUpArea: product.modularHome.totalBuiltUpArea || 0,
        totalBuildArea: product.modularHome.totalBuildArea || 0,
        numberOfStories: product.modularHome.numberOfStories || 1,
        bedroomCount: product.modularHome.bedroomCount || 0,
        bathroomCount: product.modularHome.bathroomCount || 0,
        kitchenCount: product.modularHome.kitchenCount || 0,
        livingHallCount: product.modularHome.livingHallCount || 0,
        diningCount: product.modularHome.diningCount || 0,
        doorCount: product.modularHome.doorCount || 0,
        windowCount: product.modularHome.windowCount || 0,
        ventCount: product.modularHome.ventCount || 0,
        hasWorshipRoom: typeof product.modularHome.hasWorshipRoom === 'boolean' ? product.modularHome.hasWorshipRoom : false, // Explicit boolean
        hasBalcony: typeof product.modularHome.hasBalcony === 'boolean' ? product.modularHome.hasBalcony : false, // Explicit boolean
        hasStoreRoom: typeof product.modularHome.hasStoreRoom === 'boolean' ? product.modularHome.hasStoreRoom : false, // Explicit boolean
        hasParking: typeof product.modularHome.hasParking === 'boolean' ? product.modularHome.hasParking : false, // Explicit boolean
        estimatedPrice: product.modularHome.estimatedPrice || 0,
        pricePerSqft: product.modularHome.pricePerSqft || 0,
        pricingNote: product.modularHome.pricingNote || '',
        thumbnailUrl: product.modularHome.thumbnailUrl || '',
        image3DUrl: product.modularHome.image3DUrl || '',
        image2DUrl: product.modularHome.image2DUrl || '',
        conceptPlanUrl: product.modularHome.conceptPlanUrl || '',
        documents: product.modularHome.documents || []
      });
    } else {
      setFormData(baseData as FormData);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      setSuccess('Product deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };



  if (!mounted) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {(submitting || uploading || isExporting) && (
        <LoadingOverlay 
          message={
            uploading ? 'Uploading image...' : 
            isExporting ? 'Generating export file...' : 
            showExcelPreview ? 'Importing products...' :
            editingId ? 'Updating product...' : 
            'Saving changes...'
          } 
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Products</h1>
        {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
          <div className="flex gap-2">
            {user?.role === 'ADMIN' && activeVertical === 'ECOPANELS' && (
              <>
                <button
                  onClick={handleExportData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700 transition flex items-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
                  title="Export Products"
                >
                  <FileDown size={20} /> Export
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-gray-600 text-white px-4 py-2 rounded-none hover:bg-gray-700 transition flex items-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
                  title="Download Template"
                >
                  <FileSpreadsheet size={20} /> Template
                </button>
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx, .xls"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 text-white px-4 py-2 rounded-none hover:bg-green-700 transition flex items-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
                    title="Import Products"
                  >
                    <FileUp size={20} /> Import
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => {
                setEditingId(null);
                resetForm();
                setShowForm(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-none hover:bg-primary/90 transition flex items-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-none mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-none mb-4 flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {showExcelPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Import Preview</h2>
              <button onClick={() => setShowExcelPreview(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found {excelData.length} records. 
                {validationErrors.length > 0 ? (
                  <span className="text-red-500 ml-2 font-bold">
                    {validationErrors.length} rows have errors and will be skipped.
                  </span>
                ) : (
                  <span className="text-green-500 ml-2 font-bold">
                    All rows look good!
                  </span>
                )}
              </p>
            </div>

            <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-none">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Shape</th>
                    <th className="px-4 py-2">Dimensions (mm)</th>
                    <th className="px-4 py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, idx) => (
                    <tr key={idx} className={`border-b dark:border-gray-700 ${row._errors?.length ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="px-4 py-2">
                        {row._errors?.length > 0 ? (
                          <div className="text-red-500 flex items-center gap-1" title={row._errors.join(', ')}>
                            <AlertCircle size={16} /> Error
                          </div>
                        ) : (
                          <div className="text-green-500 flex items-center gap-1">
                            <CheckCircle size={16} /> Valid
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{row.name}</td>
                      <td className="px-4 py-2">{row.productCode}</td>
                      <td className="px-4 py-2">{row.panelType}</td>
                      <td className="px-4 py-2">{row.panelShape}</td>
                      <td className="px-4 py-2">{row.thickness}x{row.width}x{row.length}</td>
                      <td className="px-4 py-2">{row.rateWithVat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowExcelPreview(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none"
              >
                Cancel
              </button>
              <button
                onClick={handleImportConfirm}
                disabled={submitting || excelData.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-2xl w-full my-8 relative">
            <button 
              onClick={() => setViewProduct(null)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="aspect-square rounded-none overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  {viewProduct.imageUrl ? (
                    <img 
                      src={getImageUrl(viewProduct.imageUrl)} 
                      alt={viewProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={48} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{viewProduct.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeVertical === 'MODULARHOMES' ? viewProduct.modularHome?.homeCode : viewProduct.productCode}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                    <p className="text-gray-800 dark:text-white">{viewProduct.category || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-medium ${
                      viewProduct.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    }`}>
                      {viewProduct.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {activeVertical === 'ECOPANELS' ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Panel Type</p>
                        <p className="text-gray-800 dark:text-white">{viewProduct.panelType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Panel Shape</p>
                        <p className="text-gray-800 dark:text-white">{viewProduct.panelShape}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Finishing</p>
                        <p className="text-gray-800 dark:text-white">{viewProduct.finishing || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price (with VAT)</p>
                        <p className="text-lg font-bold text-primary">Rs. {viewProduct.rateWithVat}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Home Type</p>
                        <p className="text-gray-800 dark:text-white">{viewProduct.modularHome?.homeType || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Type</p>
                        <p className="text-gray-800 dark:text-white">{viewProduct.modularHome?.projectType || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stories</p>
                        <p className="text-gray-800 dark:text-white">{viewProduct.modularHome?.numberOfStories || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Price</p>
                        <p className="text-lg font-bold text-primary">Rs. {viewProduct.modularHome?.estimatedPrice || 0}</p>
                      </div>
                    </>
                  )}
                </div>

                {activeVertical === 'ECOPANELS' ? (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-none space-y-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Dimensions</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Thickness:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.thickness} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Length:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.length} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Width (W1):</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.width} ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.weight} kg</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-none space-y-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Built Up Area:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.modularHome?.totalBuiltUpArea} sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Build Area:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.modularHome?.totalBuildArea} sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Bedrooms:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.modularHome?.bedroomCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Bathrooms:</span>
                        <span className="text-gray-800 dark:text-white">{viewProduct.modularHome?.bathroomCount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewProduct.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{viewProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {activeVertical === 'MODULARHOMES' ? 'Home Code' : 'Product Code'}
                  </label>
                  <input
                    type="text"
                    value={activeVertical === 'MODULARHOMES' ? (formData.homeCode || '') : (formData.productCode || '')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [activeVertical === 'MODULARHOMES' ? 'homeCode' : 'productCode']: e.target.value 
                    })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 mb-6">
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Status</label>
                   <div className="flex items-center gap-2 mt-2">
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                         type="checkbox" 
                         value="" 
                         className="sr-only peer"
                         checked={formData.isActive === true}
                         onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                       />
                       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                       <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                         {formData.isActive ? 'Active' : 'Inactive'}
                       </span>
                     </label>
                   </div>
                 </div>
              </div>

              {activeVertical === 'ECOPANELS' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Panel Type</label>
                      <select
                        value={formData.panelType}
                        onChange={(e) => setFormData({ ...formData, panelType: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      >
                        <option value="CORE">CORE</option>
                        <option value="HOLLOW">HOLLOW</option>
                        <option value="ALL">ALL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shape</label>
                      <select
                        value={formData.panelShape || 'L'}
                        onChange={(e) => setFormData({ ...formData, panelShape: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      >
                        <option value="L">L</option>
                        <option value="T">T</option>
                        <option value="BOARD">BOARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Finishing</label>
                      <select
                        value={formData.finishing || 'Without CSB'}
                        onChange={(e) => setFormData({ ...formData, finishing: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      >
                        <option value="With CSB">With CSB</option>
                        <option value="Without CSB">Without CSB</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thickness (mm)</label>
                      <input
                        type="number"
                        value={formData.thickness || 0}
                        onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Length (mm)</label>
                      <input
                        type="number"
                        value={formData.length || 0}
                        onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.weight || 0}
                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate (with VAT)</label>
                      <input
                        type="number"
                        value={formData.rateWithVat || 0}
                        onChange={(e) => setFormData({ ...formData, rateWithVat: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-none">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width (W1) Ft</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.width || 0}
                        onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thickness (W2) Ft</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.thicknessFt || 0}
                        onChange={(e) => setFormData({ ...formData, thicknessFt: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Length (L) Ft</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.lengthFt || 0}
                        onChange={(e) => setFormData({ ...formData, lengthFt: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SQFT (Auto)</label>
                      <input
                        type="number"
                        readOnly
                        value={formData.sqft || 0}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none bg-gray-100 dark:bg-gray-600 dark:text-white cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeVertical === 'MODULARHOMES' && (
                <>
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
                    {['basic', 'dimensions', 'features', 'visuals', 'docs'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setFormTab(tab)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                          formTab === tab
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {formTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Type</label>
                          <select
                            value={formData.homeType || 'PORTABLE'}
                            onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          >
                            <option value="PORTABLE">Portable</option>
                            <option value="FIXED">Fixed</option>
                            <option value="CUSTOM">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type</label>
                          <select
                            value={formData.projectType || 'RESIDENTIAL'}
                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          >
                            <option value="RESIDENTIAL">Residential</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="EXTENSION">Extension</option>
                            <option value="SCHOOL">School</option>
                            <option value="CLINIC">Clinic</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Stories</label>
                          <input
                            type="number"
                            value={formData.numberOfStories || 0}
                            onChange={(e) => setFormData({ ...formData, numberOfStories: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Price</label>
                          <input
                            type="number"
                            value={formData.estimatedPrice || 0}
                            onChange={(e) => setFormData({ ...formData, estimatedPrice: parseFloat(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Per Sqft</label>
                          <input
                            type="number"
                            value={formData.pricePerSqft || 0}
                            onChange={(e) => setFormData({ ...formData, pricePerSqft: parseFloat(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pricing Note</label>
                        <input
                          type="text"
                          value={formData.pricingNote || ''}
                          onChange={(e) => setFormData({ ...formData, pricingNote: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {formTab === 'dimensions' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-none">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Built Up Area (sq ft)</label>
                          <input
                            type="number"
                            value={formData.totalBuiltUpArea || 0}
                            onChange={(e) => setFormData({ ...formData, totalBuiltUpArea: parseFloat(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Build Area (sq ft)</label>
                          <input
                            type="number"
                            value={formData.totalBuildArea || 0}
                            onChange={(e) => setFormData({ ...formData, totalBuildArea: parseFloat(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                          <input
                            type="number"
                            value={formData.bedroomCount || 0}
                            onChange={(e) => setFormData({ ...formData, bedroomCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                          <input
                            type="number"
                            value={formData.bathroomCount || 0}
                            onChange={(e) => setFormData({ ...formData, bathroomCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kitchens</label>
                          <input
                            type="number"
                            value={formData.kitchenCount || 0}
                            onChange={(e) => setFormData({ ...formData, kitchenCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Living Halls</label>
                          <input
                            type="number"
                            value={formData.livingHallCount || 0}
                            onChange={(e) => setFormData({ ...formData, livingHallCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dining Rooms</label>
                          <input
                            type="number"
                            value={formData.diningCount || 0}
                            onChange={(e) => setFormData({ ...formData, diningCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doors</label>
                          <input
                            type="number"
                            value={formData.doorCount || 0}
                            onChange={(e) => setFormData({ ...formData, doorCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Windows</label>
                          <input
                            type="number"
                            value={formData.windowCount || 0}
                            onChange={(e) => setFormData({ ...formData, windowCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vents</label>
                          <input
                            type="number"
                            value={formData.ventCount || 0}
                            onChange={(e) => setFormData({ ...formData, ventCount: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formTab === 'features' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.hasWorshipRoom === true}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasWorshipRoom: e.target.checked }))}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Worship Room</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.hasBalcony === true}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasBalcony: e.target.checked }))}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Balcony</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.hasStoreRoom === true}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasStoreRoom: e.target.checked }))}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Room</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.hasParking === true}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasParking: e.target.checked }))}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parking</label>
                      </div>
                    </div>
                  )}

                  {formTab === 'visuals' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                        <input
                          type="text"
                          value={formData.thumbnailUrl || ''}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">3D Image URL</label>
                        <input
                          type="text"
                          value={formData.image3DUrl || ''}
                          onChange={(e) => setFormData({ ...formData, image3DUrl: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">2D Image URL</label>
                        <input
                          type="text"
                          value={formData.image2DUrl || ''}
                          onChange={(e) => setFormData({ ...formData, image2DUrl: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Concept Plan URL</label>
                        <input
                          type="text"
                          value={formData.conceptPlanUrl || ''}
                          onChange={(e) => setFormData({ ...formData, conceptPlanUrl: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  )}

                  {formTab === 'docs' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">Documentation (Quotation, BOQ, Specs)</p>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-500 italic">Document management coming soon. Please use the description field for links in the meantime.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  {(selectedImage || formData.imageUrl) && (
                    <div className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-none overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {selectedImage ? (
                        <img 
                          src={previewUrl || undefined} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={getImageUrl(formData.imageUrl)} 
                          alt="Current" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.imageUrl && !selectedImage ? 'Upload new image to replace current one' : 'Select an image for the product'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded-none focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Product
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-4 py-2 bg-primary text-white rounded-none hover:bg-primary/90 disabled:opacity-50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  {uploading ? 'Uploading Image...' : (submitting ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Image</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">
                {activeVertical === 'MODULARHOMES' ? 'Home Code' : 'Code'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">
                {activeVertical === 'MODULARHOMES' ? 'Type' : 'Specs'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">
                {activeVertical === 'MODULARHOMES' ? 'Area' : 'Finishing'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">
                {activeVertical === 'MODULARHOMES' ? 'Est. Price' : 'Rate'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-6 py-4">
                    {product.imageUrl ? (
                      <img 
                        src={getImageUrl(product.imageUrl)} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-none border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-none flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {activeVertical === 'MODULARHOMES' 
                      ? (product.modularHome?.homeCode || '-') 
                      : (product.productCode || '-')}
                  </td>
                  <td className="px-6 py-4 font-semibold dark:text-white">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {activeVertical === 'MODULARHOMES' ? (
                      <div>
                        <div>{product.modularHome?.homeType || '-'}</div>
                        <div className="text-xs">{product.modularHome?.projectType}</div>
                      </div>
                    ) : (
                      <>
                        <div>{product.panelType} - {product.panelShape}</div>
                        <div className="text-xs">{product.thickness}mm x {product.length}mm</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {activeVertical === 'MODULARHOMES' ? (
                      <div>{product.modularHome?.totalBuiltUpArea} sqft</div>
                    ) : (
                      product.finishing || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold dark:text-white">
                    {activeVertical === 'MODULARHOMES' ? (
                      `Rs. ${product.modularHome?.estimatedPrice || 0}`
                    ) : (
                      `Rs. ${product.rateWithVat}`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-none ${
                        product.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewProduct(product)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-none dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-none dark:hover:bg-blue-900/30 transition-all duration-300"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-none dark:hover:bg-red-900/30 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-none border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-sm font-semibold dark:text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-none border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
