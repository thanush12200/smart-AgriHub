import { useEffect, useMemo, useRef, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import CartSection from '../components/marketplace/CartSection';
import CheckoutSection from '../components/marketplace/CheckoutSection';
import MarketplaceFloatingActions from '../components/marketplace/MarketplaceFloatingActions';
import MarketplaceHero from '../components/marketplace/MarketplaceHero';
import OrderConfirmation from '../components/marketplace/OrderConfirmation';
import ProductGrid from '../components/marketplace/ProductGrid';

const MarketplacePage = () => {
  useDocTitle('Marketplace');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [cartNotice, setCartNotice] = useState({ text: '', type: 'success' });

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const cartSectionRef = useRef(null);
  const checkoutSectionRef = useRef(null);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    paymentMode: 'cod'
  });

  const { items: cartItems, itemCount, totalAmount, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  const loadProducts = async (options) => {
    const active = options || { query, category, sortBy };
    setProductsLoading(true);
    setProductsError('');

    try {
      const params = {
        page: 1,
        limit: 24,
        sort: active.sortBy || 'featured'
      };

      if (String(active.query || '').trim()) params.search = String(active.query).trim();
      if (active.category && active.category !== 'All') params.category = active.category;

      const { data } = await api.get('/products', { params });
      setProducts(Array.isArray(data.products) ? data.products : []);
      const apiCats = Array.isArray(data.categories) ? data.categories : [];
      setCategories(['All', ...apiCats.filter((c) => c && c !== 'All')]);
    } catch (err) {
      setProductsError(err.response?.data?.message || 'Failed to load marketplace products');
      setProducts([]);
      setCategories(['All']);
    } finally {
      setProductsLoading(false);
    }
  };

  // Initial load handled by the debounced effect below

  useEffect(() => {
    const handle = window.setTimeout(() => {
      loadProducts({ query, category, sortBy });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, category, sortBy]);

  const cartQuantityById = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {}),
    [cartItems]
  );

  const shippingFee = totalAmount === 0 ? 0 : totalAmount >= 5000 ? 0 : 79;
  const grandTotal = totalAmount + shippingFee;

  const handleAddToCart = (product) => {
    const result = addToCart(product);
    setCartNotice({ text: result.message, type: result.ok ? 'success' : 'error' });
  };

  const handleRemoveFromCart = (productId, name) => {
    removeFromCart(productId);
    setCartNotice({ text: `${name} removed from cart.`, type: 'success' });
  };

  const handleCheckoutOpen = () => {
    if (!cartItems.length) {
      setCartNotice({ text: 'Add products to cart before checkout.', type: 'error' });
      return;
    }

    setCheckoutError('');
    setCheckoutOpen(true);
    setLastOrder(null);
    window.setTimeout(() => {
      checkoutSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleCartQuickOpen = () => {
    cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target;
    setCheckoutForm((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setCheckoutError('');

    const ObjectKeys = ['fullName', 'phone', 'addressLine', 'city', 'state', 'pincode'];
    const missing = ObjectKeys.find((field) => !String(checkoutForm[field]).trim());
    if (missing) {
      setCheckoutError('Please fill all required checkout fields.');
      return;
    }

    if (!/^\d{10}$/.test(checkoutForm.phone.trim())) {
      setCheckoutError('Phone number must be 10 digits.');
      return;
    }

    if (!/^\d{6}$/.test(checkoutForm.pincode.trim())) {
      setCheckoutError('Pincode must be 6 digits.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const itemsPayload = cartItems.map(item => ({
        productCode: item.productCode || item.id, // Fallback to id if productCode is missing
        quantity: item.quantity
      }));
      
      const addressString = `${checkoutForm.fullName}, ${checkoutForm.addressLine}, ${checkoutForm.city}, ${checkoutForm.state} - ${checkoutForm.pincode}. Phone: ${checkoutForm.phone}`;

      const { data } = await api.post('/orders', {
        items: itemsPayload,
        deliveryAddress: addressString,
        paymentMode: checkoutForm.paymentMode
      });

      setLastOrder({
        orderId: data.order.orderId,
        itemCount,
        grandTotal: data.order.totalAmount,
        placedAt: new Date(data.order.createdAt).toLocaleString(),
        paymentMode: data.order.paymentMode
      });

      clearCart();
      setCheckoutOpen(false);
      setCartNotice({ text: `Order placed successfully. Order ID: ${data.order.orderId}`, type: 'success' });
      setCheckoutForm({
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        paymentMode: 'cod'
      });
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setCheckoutLoading(false);
      loadProducts(); // Refresh products to show updated stock
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <MarketplaceHero
        sectionRef={cartSectionRef}
        itemCount={itemCount}
        totalAmount={totalAmount}
        query={query}
        setQuery={setQuery}
        categories={categories}
        category={category}
        setCategory={setCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        productsLength={products.length}
        cartNotice={cartNotice}
        productsLoading={productsLoading}
        productsError={productsError}
      />

      <ProductGrid
        products={products}
        cartQuantityById={cartQuantityById}
        handleAddToCart={handleAddToCart}
        handleRemoveFromCart={handleRemoveFromCart}
      />

      <CartSection
        cartItems={cartItems}
        clearCart={clearCart}
        handleCheckoutOpen={handleCheckoutOpen}
        updateQuantity={updateQuantity}
        handleRemoveFromCart={handleRemoveFromCart}
        totalAmount={totalAmount}
        shippingFee={shippingFee}
        grandTotal={grandTotal}
      />

      <CheckoutSection
        checkoutOpen={checkoutOpen}
        cartItems={cartItems}
        sectionRef={checkoutSectionRef}
        checkoutForm={checkoutForm}
        handleCheckoutChange={handleCheckoutChange}
        checkoutError={checkoutError}
        setCheckoutOpen={setCheckoutOpen}
        handlePlaceOrder={handlePlaceOrder}
        checkoutLoading={checkoutLoading}
        grandTotal={grandTotal}
      />

      <OrderConfirmation lastOrder={lastOrder} />

      <MarketplaceFloatingActions
        handleCartQuickOpen={handleCartQuickOpen}
        handleCheckoutOpen={handleCheckoutOpen}
        cartItemsLength={cartItems.length}
        itemCount={itemCount}
      />

      {!products.length ? (
        <div className="card p-6 text-center text-slate-600">
          No products matched your search/filter. Try a different keyword or category.
        </div>
      ) : null}
    </div>
  );
};

export default MarketplacePage;
