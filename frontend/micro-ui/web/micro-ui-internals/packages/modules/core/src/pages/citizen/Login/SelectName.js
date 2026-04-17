import { DatePicker } from "@djb25/digit-ui-react-components";
import React from "react";

const SelectName = ({ profileData, setProfileData, handleComplete }) => {
  return (
    <React.Fragment>
      <div className="registration__header">
        <h1 className="registration__title">Step 3: Profile Details</h1>
        <span className="registration__step-count">3 of 3</span>
      </div>

      <p className="registration__description">Complete your profile</p>

      <div className="registration__field">
        <label className="registration__label">Full Name</label>
        <input
          className="registration__input"
          value={profileData.fullName}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              fullName: e.target.value,
            })
          }
          placeholder="Enter Your Name"
        />
      </div>

      <div className="registration__field">
        <label className="registration__label">Date of birth</label>
        <DatePicker
          date={profileData.dob}
          onChange={(value) =>
            setProfileData({
              ...profileData,
              dob: value,
            })
          }
          enableAgeValidation
          minAge={22}
        />
      </div>

      <button className="registration__button" onClick={handleComplete} disabled={!profileData.fullName || !profileData.dob}>
        Complete Registration
      </button>
    </React.Fragment>
  );
};

export default SelectName;
