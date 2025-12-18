"use client";
import { useEffect, useState } from "react";
import { getAllProducts, getAllCategories } from "../services/product.services";
import StoreClient from "./StoreClient";
import { useCookies } from "react-cookie";
import { ICategoryBasic, IProduct } from "@/src/types";

export default function Store() {
  const [categories, setCategories] = useState<ICategoryBasic[]>([]);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [cookies] = useCookies(["access_token"]);
  const cookieValue = cookies.access_token;
  useEffect(() => {
    async function loadCategories() {
      const data: ICategoryBasic[] = await getAllCategories(cookieValue);
      const allProducts: IProduct[] = await getAllProducts();
      setCategories(data);
      setAllProducts(allProducts);
    }

    loadCategories();
  }, []);
  return <StoreClient initialProducts={allProducts} categories={categories} />;
}
