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
  align = 'left',
  cancelButtonWidth = 150,
  submitButtonWidth = 192,
  style = {},
}) {
  return (
    <div style={{ textAlign: align, ...style }}>
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
        >
          {progress && <CircularProgress size={18} style={{ color: 'gray', marginRight: 12 }} />}
          {submitText || 'Next'}
        </Button>
      )}
    </div>
  );
};
