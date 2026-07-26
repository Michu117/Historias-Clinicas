interface MessageBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const typeStyles: Record<MessageBannerProps['type'], string> = {
  success: 'hc-banner-success',
  error: 'hc-banner-error',
  info: 'hc-banner-info',
};

export const MessageBanner = ({ type, message }: MessageBannerProps) => {
  if (!message) return null;

  return (
    <div
      className={`shrink-0 rounded-lg border px-4 py-3 text-sm ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
};

export default MessageBanner;
