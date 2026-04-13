import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { RoundedCheck, DeleteBtn, ErrorIcon } from "./svgindex";
import ButtonSelector from "./ButtonSelector";

const Toast = (props) => {
  const {
    duration = 15000, // ✅ default 15 sec
    onClose,
    error,
    warning,
  } = props;

  // ✅ Auto dismiss logic
  useEffect(() => {
    if (!onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // ❌ ERROR TOAST
  if (error) {
    return (
      <div className="toast-success" style={{ backgroundColor: "red", ...props.style }}>
        <ErrorIcon />
        <h2 style={{ ...props.labelstyle }}>{props.label}</h2>
        {props.isDleteBtn && <DeleteBtn fill="none" className="toast-close-btn" onClick={onClose} />}
      </div>
    );
  }

  // ⚠️ WARNING TOAST
  if (warning) {
    return (
      <div
        className="toast-success"
        style={{
          backgroundColor: "#EA8A3B",
          ...(props?.isWarningButtons && { display: "block" }),
          ...props.style,
        }}
      >
        <div style={{ display: "flex" }}>
          <ErrorIcon />
          <h2 style={{ marginLeft: "10px" }}>{props.label}</h2>
          {props.isDleteBtn && <DeleteBtn fill="none" className="toast-close-btn" onClick={onClose} />}
        </div>

        {props?.isWarningButtons && (
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <ButtonSelector theme="border" label="NO" onSubmit={props.onNo} style={{ marginLeft: "10px" }} />
            <ButtonSelector label="YES" onSubmit={props.onYes} style={{ marginLeft: "10px" }} />
          </div>
        )}
      </div>
    );
  }

  // ✅ SUCCESS TOAST
  return (
    <div className="toast-success" style={{ ...props.style }}>
      <RoundedCheck />
      <h2>{props.label}</h2>
      <DeleteBtn fill="none" className="toast-close-btn" onClick={onClose} />
    </div>
  );
};

Toast.propTypes = {
  label: PropTypes.string,
  onClose: PropTypes.func,
  isDleteBtn: PropTypes.bool,
  duration: PropTypes.number, // ✅ NEW PROP
};

Toast.defaultProps = {
  label: "",
  onClose: undefined,
  isDleteBtn: false,
  duration: 15000, // ✅ default 15 sec
};

export default Toast;
