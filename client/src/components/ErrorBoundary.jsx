import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

    }
    logErrorToService = (error, errorInfo) => {
        const sanitizedError = {
            message: error?.message || 'Unknown error',
            stack: import.meta.env.DEV ? error?.stack : 'Stack trace hidden',
            componentStack: import.meta.env.DEV ? errorInfo?.componentStack : 'Component stack hidden',
            timeStamp: new Date().toISOString(),
        };
    };
    handleReload = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };
    handleGoHome = () => {
        window.location.href = '/';
    };
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 rounded-full p-4">
                                <svg className="w-12 h-12 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Oops. Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                                <p className="text-sm font-mono text-red-800 break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                            >
                                Try again

                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200">
                                Go Home
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-6">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }

}
export default ErrorBoundary;