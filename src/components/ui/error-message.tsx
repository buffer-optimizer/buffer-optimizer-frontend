import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from './card';

interface ErrorMessageProps {
    error: Error;
    onRetry?: () => void;
    title?: string;
}

export function ErrorMessage({ error, onRetry, title = 'Error' }: ErrorMessageProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </button>
            )}
        </Card>
    );
}