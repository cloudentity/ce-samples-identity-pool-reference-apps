import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export default function FormFooter({
  id,
  form,
  cancelText,
  submitText,
  disabled,
  progress,
  onCancel,
  onSubmit,
  cancelButtonWidth = 150,
  submitButtonWidth = 192,
  style = {},
  formFooterContainerClass,
  ...props
}) {
  return (
    <div className={formFooterContainerClass} style={{ ...style }}>
      {onCancel && (
        <Button
          id={`${id}-cancel-button`}
          variant="outlined"
          size="large"
          disabled={progress}
          onClick={onCancel}
          style={{ marginRight: 14 }}
          sx={{
            width: cancelButtonWidth,
          }}
          {...props}
        >
          {cancelText || 'Cancel'}
        </Button>
      )}
      {onSubmit && (
        <Button
          id={`${id}-confirm-button`}
          data-testid={`${id}-confirm-button`}
          variant="contained"
          size="large"
          disabled={disabled || progress}
          onClick={() => form.handleSubmit(onSubmit)()}
          sx={{
            width: submitButtonWidth,
            color: '#fff',
          }}
          {...props}
        >
          {progress && <CircularProgress size={18} style={{ color: 'gray', marginRight: 12 }} />}
          {submitText || 'Next'}
        </Button>
      )}
    </div>
  );
};
