import { Tag } from 'lucide-react';

/**
 * Componente para mostrar precio con descuento aplicado
 */
export default function PriceDisplay({
    originalPrice,
    finalPrice,
    hasDiscount,
    discountPercentage,
    size = 'md',
    showBadge = true
}) {
    const sizeClasses = {
        sm: {
            original: 'text-sm',
            final: 'text-lg',
            badge: 'text-xs px-2 py-0.5'
        },
        md: {
            original: 'text-base',
            final: 'text-2xl',
            badge: 'text-xs px-2 py-1'
        },
        lg: {
            original: 'text-lg',
            final: 'text-3xl',
            badge: 'text-sm px-3 py-1'
        }
    };

    const classes = sizeClasses[size];

    if (!hasDiscount) {
        return (
            <div className="flex items-center gap-2">
                <span className={`font-black bg-gradient-to-r from-brand-gold to-yellow-600 bg-clip-text text-transparent ${classes.final}`}>
                    ${parseFloat(originalPrice).toFixed(2)}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-black bg-gradient-to-r from-brand-gold to-yellow-600 bg-clip-text text-transparent ${classes.final}`}>
                    ${parseFloat(finalPrice).toFixed(2)}
                </span>
                {showBadge && discountPercentage && (
                    <span className={`bg-red-500 text-white font-bold rounded-full ${classes.badge} flex items-center gap-1 animate-pulse`}>
                        <Tag className="w-3 h-3" />
                        -{discountPercentage}%
                    </span>
                )}
            </div>
            <span className={`text-slate-500 dark:text-slate-400 line-through ${classes.original}`}>
                ${parseFloat(originalPrice).toFixed(2)}
            </span>
        </div>
    );
}
