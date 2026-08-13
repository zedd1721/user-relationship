import { Component, type ReactNode } from 'react';

interface GraphErrorBoundaryProps {
  children: ReactNode;
  onFallbackToMode: () => void;
}

interface GraphErrorBoundaryState {
  hasError: boolean;
}

export default class GraphErrorBoundary extends Component<GraphErrorBoundaryProps, GraphErrorBoundaryState> {
  state: GraphErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GraphErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('3D graph failed to render:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center text-gray-400">
          <p>3D view isn't supported in this browser or session.</p>
          <button
            type="button"
            onClick={this.props.onFallbackToMode}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-1.5 text-sm text-gray-200 hover:bg-gray-800"
          >
            Switch to 2D
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
