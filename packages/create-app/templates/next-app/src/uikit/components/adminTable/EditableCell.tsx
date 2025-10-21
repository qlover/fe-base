'use client';

import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Button, Input } from 'antd';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';
import type { InputRef } from 'antd/lib/input';

interface EditableCellProps {
  value: string;
  className?: string;
  onSave?: (value: string) => Promise<void> | void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  className,
  onSave
}) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleEdit = () => {
    if (loading) return;
    setEditing(true);
    setInputValue(value);
  };

  const handleSave = async () => {
    if (loading) return;
    if (onSave && inputValue !== value) {
      setLoading(true);
      try {
        await onSave(inputValue);
        setEditing(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setEditing(false);
    setInputValue(value);
  };

  if (editing) {
    return (
      <div
        data-testid="EditableCellContainer"
        className="flex w-full items-center"
      >
        <Input
          data-testid="EditableCellInput"
          disabled={loading}
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSave}
          onBlur={handleSave}
        />
        <div data-testid="EditableCellActions" className="flex gap-0.5 ">
          <Button
            disabled={loading}
            className="cursor-pointer flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
            onClick={handleSave}
          >
            {loading ? <LoadingOutlined /> : <CheckOutlined />}
          </Button>
          <Button
            disabled={loading}
            className="cursor-pointer flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
            onClick={handleCancel}
          >
            <CloseOutlined />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="EditableCellSpan"
      className={clsx(
        'group flex items-center relative py-0.5 px-1 w-full max-w-48',
        className
      )}
      onDoubleClick={handleEdit}
    >
      <span title={value} className="truncate flex-1">
        {value}
      </span>
      <span
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer ml-2 text-gray-400 hover:text-blue-500"
      >
        <EditOutlined className="text-sm" />
      </span>
    </div>
  );
};
