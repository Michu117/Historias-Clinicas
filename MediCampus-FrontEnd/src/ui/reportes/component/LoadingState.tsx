import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Cargando datos...'
}: LoadingStateProps): JSX.Element {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center">
        <div className="relative h-12 w-12">
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-t-blue-600"
            style={{
              borderRightColor: 'var(--outline-variant)',
              borderBottomColor: 'var(--outline-variant)',
              borderLeftColor: 'var(--outline-variant)'
            }}
          ></div>
        </div>
        <p className="mt-4 font-medium" style={{ color: 'var(--on-surface-variant)' }}>{message}</p>
      </div>
    </div>
  );
}
