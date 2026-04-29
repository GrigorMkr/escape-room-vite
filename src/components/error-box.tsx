type ErrorBoxProps = {
  errors: string[];
  ariaLive?: 'off' | 'polite' | 'assertive';
  className?: string;
};

const ErrorBox = ({errors, ariaLive = 'polite', className}: ErrorBoxProps) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={className ?? 'form-error'} role="alert" aria-live={ariaLive}>
      <ul>
        {errors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorBox;
