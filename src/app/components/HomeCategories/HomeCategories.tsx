"use client"

import { useEffect, useState } from 'react';
import { getAllCategories } from '../../services/product.services';
import CardCategory from '../CardCategory/CardCategory';
import category1 from '../../../assets/category1.jpg'
import category2 from '../../../assets/category2.jpg'
import category3 from '../../../assets/category3.webp'
import category5 from '../../../assets/category4.webp'
import category4 from '../../../assets/category5.jpg'
import { ICategoryBasic } from '@/src/types';


function HomeCategories() {
  const [categories, setCategories] = useState<ICategoryBasic[]>([]);

  const defaultImages = [category1, category2, category3, category4, category5];

  useEffect(() => {
    async function loadCategories() {
      const data: ICategoryBasic[] = await getAllCategories();
      setCategories(data);
    }

    loadCategories();
  }, []);

  return (
    <div className="flex flex-wrap justify-evenly">
      {categories.map((category, index) => (
        <CardCategory
          key={category.id}
          {...category}
          /* image={category.image || defaultImages[index]} */
          image={defaultImages[index] || category.image}
        />
      ))}
    </div>
  );
}

export default HomeCategories;

