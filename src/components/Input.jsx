const Input = ({
  ref = null,
  className = "",
  type = "text",
  placeholder = "",
  value,
  onChange = () => {},
  readOnly = false,
}) => {
  return (
    <input
      ref={ref}
      className={className}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};

export default Input;
