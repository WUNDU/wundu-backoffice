export const Form: React.FC<{
  children: React.ReactNode;
  method: string;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}> = ({ children, method, className, onSubmit }) => {
  return (
    <form method={method} className={className} onSubmit={onSubmit}>
      {children}
    </form>
  );
};