interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  onBack,
  showBackButton,
}) => {
  return (
    <div className="modal-header">
      <div className="modal-header-content">
        {showBackButton && onBack && (
          <button onClick={onBack} className="modal-back-button">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h2 className="modal-title">{title}</h2>
      </div>
      <button onClick={onClose} className="modal-close-button">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
