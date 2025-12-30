import { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { useCabinetStore } from '../store/cabinetStore';
import { cn } from '../utils/cn';
import type { ValidationMessage } from '../types';

interface ValidationPanelProps {
  className?: string;
}

export function ValidationPanel({ className }: ValidationPanelProps) {
  const validateProject = useCabinetStore((s) => s.validateProject);
  const currentProject = useCabinetStore((s) => s.currentProject);
  
  const validationResult = useMemo(() => {
    return validateProject();
  }, [validateProject, currentProject]);
  
  const { isValid, errors, warnings, info } = validationResult;
  
  const totalIssues = errors.length + warnings.length;
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {isValid ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            Validação
          </h2>
          <button
            onClick={() => validateProject()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
            title="Revalidar projeto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Summary */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className={cn(
            'px-2 py-1 rounded-full',
            errors.length > 0 
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {errors.length} erro{errors.length !== 1 ? 's' : ''}
          </span>
          <span className={cn(
            'px-2 py-1 rounded-full',
            warnings.length > 0 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {warnings.length} aviso{warnings.length !== 1 ? 's' : ''}
          </span>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {info.length} info
          </span>
        </div>
      </div>
      
      {/* Validation Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {totalIssues === 0 && info.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400">
              Projeto válido! Nenhum problema encontrado.
            </p>
          </div>
        ) : (
          <>
            {/* Errors */}
            {errors.length > 0 && (
              <ValidationSection
                title="Erros"
                icon={<AlertCircle className="w-4 h-4" />}
                messages={errors}
                severity="error"
              />
            )}
            
            {/* Warnings */}
            {warnings.length > 0 && (
              <ValidationSection
                title="Avisos"
                icon={<AlertTriangle className="w-4 h-4" />}
                messages={warnings}
                severity="warning"
              />
            )}
            
            {/* Info */}
            {info.length > 0 && (
              <ValidationSection
                title="Informações"
                icon={<Info className="w-4 h-4" />}
                messages={info}
                severity="info"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ValidationSectionProps {
  title: string;
  icon: React.ReactNode;
  messages: ValidationMessage[];
  severity: 'error' | 'warning' | 'info';
}

function ValidationSection({ title, icon, messages, severity }: ValidationSectionProps) {
  const colors = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500',
    },
  };
  
  const color = colors[severity];
  
  return (
    <div>
      <h3 className={cn('text-sm font-medium mb-2 flex items-center gap-1.5', color.text)}>
        <span className={color.icon}>{icon}</span>
        {title} ({messages.length})
      </h3>
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <div
            key={`${msg.ruleName}-${index}`}
            className={cn(
              'p-3 rounded-lg border text-sm',
              color.bg,
              color.border
            )}
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {msg.ruleName}
            </div>
            <p className={cn('mt-0.5', color.text)}>
              {msg.message}
            </p>
            {msg.field && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Campo: {msg.field}
                {msg.value !== undefined && ` • Valor: ${msg.value}`}
                {msg.limit !== undefined && ` • Limite: ${msg.limit}`}
              </p>
            )}
            {msg.suggestion && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                💡 {msg.suggestion}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
