import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { LuCalendarIcon } from "./svgindex";
import Toast from "./Toast";
// import { CalendarIcon } from "../atoms/svgindex";

const DatePicker = ({ date, onChange, disabled, style }) => {
  const [toast, setToast] = useState(null);
  const hiddenDateRef = useRef();

  // 👉 yyyy-mm-dd → dd/mm/yyyy
  const formatDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 👉 dd/mm/yyyy → yyyy-mm-dd
  const toInputFormat = (date) => {
    if (!date) return "";
    if (date.includes("-")) return date;

    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  };

  // 👉 Age validation (18+)
  const isValidAge = (dateStr) => {
    const today = new Date();
    const dob = new Date(dateStr);

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= 18;
  };

  const handleDateChange = (e) => {
    const raw = e.target.value; // yyyy-mm-dd

    if (!isValidAge(raw)) {
      setToast({
        type: "warning",
        message: "User must be at least 18 years old",
      });
      return;
    }

    onChange?.(raw);
  };
  return (
    <React.Fragment>
      <div
        className="date-picker"
        style={{
          position: "relative",
          width: "100%",
          cursor: disabled ? "not-allowed" : "pointer",
          ...style,
        }}
      >
        {/* 👉 Visible formatted input */}
        <input
          type="text"
          readOnly
          disabled={disabled}
          value={date ? formatDisplay(date) : ""}
          placeholder="DD/MM/YYYY"
          className={`registration__input ${disabled ? "disabled" : ""}`}
          onClick={() => hiddenDateRef.current?.showPicker?.()}
        />

        {/* 👉 Hidden actual date input */}
        <input
          type="date"
          ref={hiddenDateRef}
          value={toInputFormat(date)}
          onChange={handleDateChange}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        />

        {/* 👉 Optional icon */}
        <LuCalendarIcon
          color="#d1d1d1"
          onClick={() => hiddenDateRef.current?.showPicker?.()}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        />
      </div>
      {toast && <Toast warning={toast.type === "warning"} error={toast.type === "error"} label={toast.message} onClose={() => setToast(null)} />}
    </React.Fragment>
  );
};

DatePicker.propTypes = {
  date: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};

export default DatePicker;
