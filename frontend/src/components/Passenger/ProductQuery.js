import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const ProductQuery = () => {
  const [searchParams] = useSearchParams();
  const departure = searchParams.get('departure');
  const arrival = searchParams.get('arrival');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/products?departure=${departure}&arrival=${arrival}`);
        setProducts(response.data);
      } catch (error) {
        console.error('获取产品列表失败', error);
      }
    };
    if (departure && arrival) {
      fetchProducts();
    }
  }, [departure, arrival]);

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.flightNumber} - {product.departureAirport} to {product.arrivalAirport} - {product.cabinClass} - {product.price} - {product.discount}% off
          <button>选择</button>
        </li>
      ))}
    </ul>
  );
};

export default ProductQuery;    