import React from 'react';
import { tableBase, tableHeader, tableCell, sizeVariants, variantStyles } from './Table.css';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
}

export interface TableProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Table columns configuration */
  columns: TableColumn[];
  /** Table data */
  data: Record<string, any>[];
  /** Custom class name */
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  size = 'md',
  variant = 'tertiary',
  columns,
  data,
  className,
}) => {
  const classes = [
    tableBase,
    sizeVariants[size],
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <table className={classes}>
      <thead>
        <tr className={tableHeader}>
          {columns.map((column) => (
            <th
              key={column.key}
              className={tableCell}
              style={{ width: column.width }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key} className={tableCell}>
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};