import React from 'react';
import { tableBase, tableHeader, tableCell, sizeVariants, sizeVariantsT, variantStyles } from './Table.css';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
}

export interface TableProps {
  /** Standard size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size */
  sizeT?: 'tshirtXS' | 'tshirtS' | 'tshirtM' | 'tshirtL' | 'tshirtXL';
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
  sizeT,
  variant = 'tertiary',
  columns,
  data,
  className,
}) => {
  // Use sizeT if provided, otherwise use size
  const sizeClass = sizeT ? sizeVariantsT[sizeT] : sizeVariants[size];
  
  const classes = [
    tableBase,
    sizeClass,
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