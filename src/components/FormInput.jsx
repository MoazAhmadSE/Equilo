import React from "react";
import Input from "./Input"; // your styled/custom Input component

const FormInput = ({
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  focusRef,
  error,
}) => {
  return (
    <>
      <Input
        placeholder={placeholder}
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        ref={(el) => (focusRef.current[name] = el)}
      />
      {error && <div className="login-error-text">{error}</div>}
    </>
  );
};

export default FormInput;
