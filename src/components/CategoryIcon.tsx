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
  Utensils,
  Fuel,
  Baby,
  PawPrint,
  Film,
  Dumbbell,
  Shield,
  Gift,
  Briefcase,
  Plane,
  Coffee,
  Music,
  Smartphone,
  Tv,
  Zap,
  BookOpen,
  Sparkles,
  LucideProps,
} from 'lucide-react';
import { CategoryInfo, CATEGORIES } from '../types/expense';

export const AVAILABLE_CATEGORY_ICONS: { id: string; label: string; component: React.FC<LucideProps> }[] = [
  { id: 'Home', label: 'Casa / Moradia', component: Home },
  { id: 'ShoppingCart', label: 'Supermercado', component: ShoppingCart },
  { id: 'Utensils', label: 'Restaurante / Alimentação', component: Utensils },
  { id: 'Car', label: 'Carro / Transporte', component: Car },
  { id: 'Fuel', label: 'Combustível', component: Fuel },
  { id: 'CreditCard', label: 'Cartão de Crédito', component: CreditCard },
  { id: 'HeartPulse', label: 'Saúde / Farmácia', component: HeartPulse },
  { id: 'GraduationCap', label: 'Educação / Cursos', component: GraduationCap },
  { id: 'Wifi', label: 'Internet / Telecom', component: Wifi },
  { id: 'Smartphone', label: 'Celular / Telefonia', component: Smartphone },
  { id: 'Tv', label: 'Streaming / TV', component: Tv },
  { id: 'Palmtree', label: 'Lazer / Viagens', component: Palmtree },
  { id: 'Plane', label: 'Passagens / Viagem', component: Plane },
  { id: 'Dumbbell', label: 'Academia / Esporte', component: Dumbbell },
  { id: 'PawPrint', label: 'Pets / Animais', component: PawPrint },
  { id: 'Baby', label: 'Filhos / Crianças', component: Baby },
  { id: 'Film', label: 'Cinema / Cultura', component: Film },
  { id: 'Coffee', label: 'Café / Padaria', component: Coffee },
  { id: 'Gift', label: 'Presentes / Doações', component: Gift },
  { id: 'Briefcase', label: 'Trabalho / Negócios', component: Briefcase },
  { id: 'Zap', label: 'Energia Elétrica', component: Zap },
  { id: 'BookOpen', label: 'Livros / Leitura', component: BookOpen },
  { id: 'Shield', label: 'Seguros / Proteção', component: Shield },
  { id: 'Tag', label: 'Outros / Diversos', component: Tag },
];

export const AVAILABLE_CATEGORY_COLORS = [
  { name: 'Esmeralda', color: '#065f46', bgColor: '#ecfdf5', borderColor: '#a7f3d0' },
  { name: 'Verde', color: '#047857', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
  { name: 'Azul Claro', color: '#0284c7', bgColor: '#f0f9ff', borderColor: '#bae6fd' },
  { name: 'Azul Marinho', color: '#1e40af', bgColor: '#eff6ff', borderColor: '#bfdbfe' },
  { name: 'Roxo', color: '#7c3aed', bgColor: '#f5f3ff', borderColor: '#ddd6fe' },
  { name: 'Rosa / Carmim', color: '#e11d48', bgColor: '#fff1f2', borderColor: '#fecdd3' },
  { name: 'Vermelho', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca' },
  { name: 'Laranja', color: '#ea580c', bgColor: '#fff7ed', borderColor: '#fed7aa' },
  { name: 'Âmbar', color: '#d97706', bgColor: '#fffbeb', borderColor: '#fde68a' },
  { name: 'Ciano', color: '#0891b2', bgColor: '#ecfeff', borderColor: '#a5f3fc' },
  { name: 'Ardósia / Cinza', color: '#475569', bgColor: '#f8fafc', borderColor: '#e2e8f0' },
];

interface CategoryIconProps extends LucideProps {
  iconName?: string;
  category?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, category, ...props }) => {
  // Se passou o nome direto do ícone
  const targetIconName = iconName || (category && CATEGORIES[category]?.iconName) || '';

  if (targetIconName) {
    const matched = AVAILABLE_CATEGORY_ICONS.find(
      (item) => item.id.toLowerCase() === targetIconName.toLowerCase()
    );
    if (matched) {
      const Component = matched.component;
      return <Component {...props} />;
    }
  }

  // Fallback baseado em IDs padrão antigos (se ainda houver)
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

export const CategoryBadge: React.FC<{
  category?: string;
  categoryObj?: CategoryInfo;
  showIcon?: boolean;
}> = ({ category, categoryObj, showIcon = true }) => {
  if (!category && !categoryObj) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        {showIcon && <Tag className="w-3.5 h-3.5" />}
        <span>Sem categoria</span>
      </span>
    );
  }

  const cat = categoryObj || (category ? CATEGORIES[category] : undefined) || {
    id: category || 'sem_categoria',
    label: category || 'Sem categoria',
    iconName: 'Tag',
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: cat.bgColor,
        color: cat.color,
        border: `1px solid ${cat.borderColor}`,
      }}
    >
      {showIcon && <CategoryIcon iconName={cat.iconName} category={category} className="w-3.5 h-3.5" />}
      <span>{cat.label.split(' ')[0]}</span>
    </span>
  );
};
