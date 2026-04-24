import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProductList from '../pages/ProductList';
import ProductDetail from '../pages/ProductDetail';
import DeepAnalysis from '../pages/DeepAnalysis';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/products" replace />,
      },
      {
        path: 'products',
        element: <ProductList />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetail />,
      },
      {
        path: 'products/:productId/deep-analysis',
        element: <DeepAnalysis />,
      },
    ],
  },
]);
