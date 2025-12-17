import { getAllProducts, getAllCategories } from "../services/product.services";
import StoreClient from "./StoreClient";

export default async function Store() {
  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories()
  ]);
  
  return <StoreClient initialProducts={allProducts} categories={categories} />;
}