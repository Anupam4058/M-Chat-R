import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveChildInfo, ChildInfoData } from "../redux/Action";
import { RootState } from "../redux/Store";
import {isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

interface ChildInfoFormData {
  guardianName: string;
  guardianPhone: string;
  childName: string;
  gender: "male" | "female" | "";
  dateOfBirth: string;
  city: string;
}

const ChildInfo: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get existing child info from Redux store
  const existingChildInfo = useSelector((state: RootState) => (state as any).childInfo);
  
  const [formData, setFormData] = useState<ChildInfoFormData>({
    guardianName: "",
    guardianPhone: "",
    childName: "",
    gender: "",
    dateOfBirth: "",
    city: "",
  });

  // Initialize form with existing data when component mounts
  useEffect(() => {
    if (existingChildInfo) {
      setFormData({
        guardianName: existingChildInfo.guardianName || "",
        guardianPhone: existingChildInfo.guardianPhone || "",
        childName: existingChildInfo.childName || "",
        gender: existingChildInfo.gender || "",
        dateOfBirth: existingChildInfo.dateOfBirth || "",
        city: existingChildInfo.city || "",
      });
    }
  }, [existingChildInfo]);

  const [errors, setErrors] = useState<Partial<Record<keyof ChildInfoFormData, string>>>({});

  const handleInputChange = (field: keyof ChildInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    if (!phoneNumber.trim()) return false;
    
    try {
      // Try to parse the phone number
      const parsedNumber = parsePhoneNumber(phoneNumber);
      return parsedNumber ? isValidPhoneNumber(phoneNumber) : false;
    } catch (error) {
      return false;
    }
  };

  const formatPhoneNumber = (phoneNumber: string): string => {
    try {
      const parsedNumber = parsePhoneNumber(phoneNumber);
      return parsedNumber ? parsedNumber.formatInternational() : phoneNumber;
    } catch (error) {
      return phoneNumber;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChildInfoFormData, string>> = {};

    if (!formData.guardianName.trim()) {
      newErrors.guardianName = "Guardian name is required";
    }

    if (!formData.guardianPhone.trim()) {
      newErrors.guardianPhone = "Phone number is required";
    } else if (!validatePhoneNumber(formData.guardianPhone)) {
      newErrors.guardianPhone = "Please enter a valid phone number (e.g., +91 9876543210)";
    }

    if (!formData.childName.trim()) {
      newErrors.childName = "Child name is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const ageInMonths = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      
      if (ageInMonths < 16 || ageInMonths > 30) {
        newErrors.dateOfBirth = "Child must be between 16-30 months old for this assessment";
      }
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save child info to Redux store
      const childInfo: ChildInfoData = {
        guardianName: formData.guardianName.trim(),
        guardianPhone: formatPhoneNumber(formData.guardianPhone.trim()),
        childName: formData.childName.trim(),
        gender: formData.gender as "male" | "female",
        dateOfBirth: formData.dateOfBirth,
        city: formData.city.trim(),
      };
      
      dispatch(saveChildInfo(childInfo));
      navigate("/question/1");
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow only digits, spaces, dashes, parentheses, and plus sign
    const cleanedValue = value.replace(/[^\d\s\-\(\)\+]/g, '');
    handleInputChange("guardianPhone", cleanedValue);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 flex flex-col items-center justify-center py-8 px-2">
      <div className="w-full max-w-2xl bg-white/80 rounded-2xl shadow-2xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent mb-2">
            Child Information
          </h1>
          <p className="text-gray-600 text-lg">
            Please provide the following information to begin the M-CHAT assessment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Guardian Information */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
            <h2 className="text-xl font-semibold text-indigo-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Guardian Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-indigo-700 mb-2">
                  Guardian Name *
                </label>
                <input
                  type="text"
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange("guardianName", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.guardianName ? "border-red-500 bg-red-50" : "border-indigo-300 bg-white/70"
                  }`}
                  placeholder="Enter guardian's full name"
                />
                {errors.guardianName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.guardianName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="guardianPhone" className="block text-sm font-medium text-indigo-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.guardianPhone ? "border-red-500 bg-red-50" : "border-indigo-300 bg-white/70"
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.guardianPhone && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.guardianPhone}
                  </p>
                )}
                <p className="text-xs text-indigo-600 mt-2">
                  Enter number with country code.
                </p>
              </div>
            </div>
          </div>

          {/* Child Information */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Child Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-purple-700 mb-2">
                  Child's Name *
                </label>
                <input
                  type="text"
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => handleInputChange("childName", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.childName ? "border-red-500 bg-red-50" : "border-purple-300 bg-white/70"
                  }`}
                  placeholder="Enter child's full name"
                />
                {errors.childName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.childName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Gender *
                </label>
                <div className="flex space-x-6 justify-center bg-white/70 rounded-lg p-3 border border-purple-300">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-purple-700 font-medium">Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-purple-700 font-medium">Female</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-purple-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.dateOfBirth ? "border-red-500 bg-red-50" : "border-purple-300 bg-white/70"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.dateOfBirth}
                  </p>
                )}
                <p className="text-xs text-purple-600 mt-2">
                  Child must be between 16-30 months old
                </p>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-purple-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.city ? "border-red-500 bg-red-50" : "border-purple-300 bg-white/70"
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildInfo; 