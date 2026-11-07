import React from 'react';
import {
  Home,
  ShoppingCart,
  Car,
  CreditCard,
  HeartPulse,
  GraduationCap,
  Wifi,
  Palmtree,
  Tag,
  LucideProps,
} from 'lucide-react';
import { ExpenseCategory, CATEGORIES } from '../types/expense';

interface CategoryIconProps extends LucideProps {
  category: ExpenseCategory;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  switch (category) {
    case 'moradia':
      return <Home {...props} />;
    case 'alimentacao':
      return <ShoppingCart {...props} />;
    case 'transporte':
      return <Car {...props} />;
    case 'cartao':
      return <CreditCard {...props} />;
    case 'saude':
      return <HeartPulse {...props} />;
    case 'educacao':
      return <GraduationCap {...props} />;
    case 'servicos':
      return <Wifi {...props} />;
    case 'lazer':
      return <Palmtree {...props} />;
    case 'outros':
    default:
      return <Tag {...props} />;
  }
};

export const CategoryBadge: React.FC<{ category: ExpenseCategory; showIcon?: boolean }> = ({
  category,
  showIcon = true,
}) => {
  const cat = CATEGORIES[category] || CATEGORIES.outros;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: cat.bgColor,
        color: cat.color,
        border: `1px solid ${cat.borderColor}`,
      }}
    >
      {showIcon && <CategoryIcon category={category} className="w-3.5 h-3.5" />}
      <span>{cat.label.split(' ')[0]}</span>
    </span>
  );
};
