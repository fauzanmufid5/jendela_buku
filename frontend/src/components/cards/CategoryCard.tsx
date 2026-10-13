import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/katalog?category=${category.slug}`}
      className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-[#0f2942]/30 hover:shadow-lg transition-all flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#0f2942] group-hover:text-white text-[#0f2942] flex items-center justify-center transition-colors">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#2563eb] transition-colors line-clamp-1">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {category.books_count !== undefined ? `${category.books_count} Judul` : 'Jelajahi'}
        </span>
        <span className="text-[#2563eb] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Katalog <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
