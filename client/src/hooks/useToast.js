import {
  useState,
  useCallback
} from 'react';

export function useToast() {
  const [
    toast,
    setToast
  ] = useState(null);

  const showToast =
    useCallback(
      (toastData) => {
        if (
          !toastData ||
          !toastData.message
        ) {
          return;
        }

        setToast({
          id:
            Date.now() +
            Math.random(),

          type:
            toastData.type ||
            'info',

          title:
            toastData.title ||
            '',

          message:
            toastData.message,

          duration:
            toastData.duration ||
            5000
        });
      },
      []
    );

  const hideToast =
    useCallback(() => {
      setToast(null);
    }, []);

  const showSuccess =
    useCallback(
      (
        message,
        title = 'Success'
      ) => {
        showToast({
          type: 'success',
          title,
          message
        });
      },
      [showToast]
    );

  const showError =
    useCallback(
      (
        message,
        title = 'Error'
      ) => {
        showToast({
          type: 'error',
          title,
          message
        });
      },
      [showToast]
    );

  const showWarning =
    useCallback(
      (
        message,
        title = 'Warning'
      ) => {
        showToast({
          type: 'warning',
          title,
          message
        });
      },
      [showToast]
    );

  const showInfo =
    useCallback(
      (
        message,
        title = 'Info'
      ) => {
        showToast({
          type: 'info',
          title,
          message
        });
      },
      [showToast]
    );

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}