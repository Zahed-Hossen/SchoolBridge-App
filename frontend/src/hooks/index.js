import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Custom hook for API calls with loading, error, and data state management
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {boolean} immediate - Whether to call the API immediately on mount
 */
export const useApi = (apiFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        setData(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        console.error('API Error:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
    clearError,
  };
};

/**
 * Custom hook for form state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Function to call on form submit
 * @param {Object} validationSchema - Yup validation schema (optional)
 */
export const useForm = (
  initialValues = {},
  onSubmit,
  validationSchema = null,
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate field on blur if validation schema exists
    if (validationSchema) {
      validateField(field);
    }
  };

  const validateField = async (field) => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validateAt(field, values);
      setErrors((prev) => ({ ...prev, [field]: null }));
      return true;
    } catch (error) {
      setErrors((prev) => ({ ...prev, [field]: error.message }));
      return false;
    }
  };

  const validateForm = async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        Alert.alert(
          'Validation Error',
          'Please fix the errors before submitting',
        );
        return;
      }

      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      Alert.alert('Error', 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue: (field, value) =>
      setValues((prev) => ({ ...prev, [field]: value })),
    setFieldError: (field, error) =>
      setErrors((prev) => ({ ...prev, [field]: error })),
  };
};

/**
 * Custom hook for async storage operations
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 */
export const useAsyncStorage = (key, defaultValue = null) => {
  const [storedValue, setStoredValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, [key]);

  const loadStoredValue = async () => {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
    } finally {
      setLoading(false);
    }
  };

  const setValue = async (value) => {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      setStoredValue(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  const removeValue = async () => {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      setStoredValue(defaultValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  };

  return [storedValue, setValue, removeValue, loading];
};

/**
 * Custom hook for debounced values
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
