interface LoginButtonProps {
  isSubmitting: boolean;
}

export function LoginButton({ isSubmitting }: LoginButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full h-10 bg-[#00216b] hover:bg-[#003cc3] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-md transition-colors flex items-center justify-center gap-2"
    >
      {isSubmitting ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          A entrar...
        </>
      ) : (
        "Entrar"
      )}
    </button>
  );
}
