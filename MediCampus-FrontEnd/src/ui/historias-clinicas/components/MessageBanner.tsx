interface MessageBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const typeStyles: Record<MessageBannerProps['type'], string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export const MessageBanner = ({ type, message }: MessageBannerProps) => {
  if (!message) return null;

  return (
    <div
      className={`shrink-0 rounded-global border px-4 py-3 text-sm ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
};

export default MessageBanner;
