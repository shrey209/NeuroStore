// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from "./utils/fileUtils"
const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/auth/session`, {
          withCredentials: true,
        });
        if (res.data.isLoggedIn) {
          setIsLoggedIn(true);
        }
      } catch (err) {
       console.log(err)
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, []);

  if (isChecking) return <div>Loading...</div>;

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
