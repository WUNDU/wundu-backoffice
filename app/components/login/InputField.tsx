interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}

export function InputField({
  id,
  label,
  type,
  name,
  placeholder,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] rounded-md px-3 py-2.5 placeholder:text-gray-400 outline-none focus:border-[#003cc3] focus:ring-2 focus:ring-[#003cc3]/10 transition-all"
      />
    </div>
  );
}