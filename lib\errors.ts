import { toast } from 'sonner';

export type ErrorCode = 'API_ERROR' | 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'SCAN_ERROR' | 'NETWORK_ERROR';
export type ErrorSeverity = 'error' | 'warning' | 'info';

export class AppError extends Error {
  code: ErrorCode;
  severity: ErrorSeverity;
  retryable: boolean;

  constructor(message: string, code: ErrorCode, severity: ErrorSeverity = 'error', retryable = false) {
    super(message);
    this.code = code;
    this.severity = severity;
    this.retryable = retryable;
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string, onRetry?: () => void) {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    if (error.name === 'ZodError') {
      appError = new AppError('Dados inválidos. Verifique as configurações.', 'VALIDATION_ERROR', 'warning');
    } else if (error.message.includes('fetch') || error.message.includes('Network')) {
      appError = new AppError('Falha de conexão. Verifique sua internet.', 'NETWORK_ERROR', 'error', true);
    } else if (error.message.includes('HTTP')) {
      appError = new AppError(`Erro na API (${error.message}).`, 'API_ERROR', 'error');
    } else {
      appError = new AppError(error.message, 'SCAN_ERROR', 'error');
    }
  } else {
    appError = new AppError('Ocorreu um erro desconhecido.', 'SCAN_ERROR', 'error');
  }

  console.error(`[${appError.code}] ${context ? `(${context}) ` : ''}${appError.message}`);

  const toastOptions: any = {};
  if (appError.retryable && onRetry) {
    toastOptions.action = {
      label: 'Tentar Novamente',
      onClick: onRetry,
    };
  }

  if (appError.severity === 'error') {
    toast.error(appError.message, toastOptions);
  } else if (appError.severity === 'warning') {
    toast.warning(appError.message, toastOptions);
  } else {
    toast.info(appError.message, toastOptions);
  }
}
