import React, { forwardRef, useState } from "react";
import SVGIcons from "../assets/icons/SVGIcons";

const Input = forwardRef(
  (
    {
      className = "",
      type = "text",
      placeholder = "",
      value,
      onChange = () => {},
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";
    const inputType = isPasswordType
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="input-wrapper">
        <input
          ref={ref}
          className={`input ${className}`}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          readOnly={readOnly}
          {...props}
        />
        {isPasswordType && (
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={0}
          >
            {showPassword ? (
              <SVGIcons.hidePassword />
            ) : (
              <SVGIcons.viewPassword />
            )}
          </span>
        )}
      </div>
    );
  }
);

export default Input;
