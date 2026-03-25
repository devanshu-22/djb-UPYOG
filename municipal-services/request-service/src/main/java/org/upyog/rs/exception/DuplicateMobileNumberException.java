package org.upyog.rs.exception;

public class DuplicateMobileNumberException extends RuntimeException{

    private final String mobileNumber;

    public DuplicateMobileNumberException(String mobileNumber) {
        super("Mobile number already registered: " + mobileNumber);
        this.mobileNumber = mobileNumber;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

}
