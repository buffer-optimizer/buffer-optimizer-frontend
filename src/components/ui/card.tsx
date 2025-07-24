interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}