import React from 'react';
import { Car, Users, ClipboardList, Shield, Star, Coffee } from 'lucide-react';
import { TaskType } from '../../types';

interface TaskBadgeProps {
  task: TaskType | { id: string; name: string; color?: string; icon?: string };
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TaskBadge: React.FC<TaskBadgeProps> = ({ task, size = 'sm', showIcon = true }) => {
  const getIcon = () => {
    switch (task.id) {
      case 'parking':
        return <Car className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />;
      case 'support':
        return <Users className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />;
      case 'registration':
        return <ClipboardList className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />;
      case 'floater':
        return <Shield className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />;
      default:
        return <Star className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />;
    }
  };

  const getColorClasses = () => {
    switch (task.id) {
      case 'parking':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'support':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'registration':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'floater':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${getColorClasses()} ${sizeClasses}`}
    >
      {showIcon && getIcon()}
      <span>{task.name}</span>
    </span>
  );
};
export default TaskBadge;
