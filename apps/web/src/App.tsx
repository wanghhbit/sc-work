import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StorefrontLayout } from '@/features/storefront/pages/storefront-layout'
import { HomePage } from '@/features/storefront/pages/home-page'
import { AuthPage } from '@/features/storefront/pages/auth-page'
import { ProductsPage } from '@/features/storefront/pages/products-page'
import { ProductDetailPage } from '@/features/storefront/pages/product-detail-page'
import { CartPage } from '@/features/storefront/pages/cart-page'
import { CheckoutPage } from '@/features/storefront/pages/checkout-page'
import { PayPage } from '@/features/storefront/pages/pay-page'
import { OrdersPage } from '@/features/storefront/pages/orders-page'
import { ContactPage } from '@/features/storefront/pages/contact-page'
import { ComingSoonPage } from '@/features/storefront/pages/coming-soon-page'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="pay" element={<PayPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="coming-soon" element={<ComingSoonPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
