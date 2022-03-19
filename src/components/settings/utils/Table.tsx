//@ts-nocheck
import { FC, ReactElement, useEffect, useState } from "react";
import { Stack } from "@chakra-ui/react";
import { Column, TableOptions, useTable } from "react-table";
import React from "react";
const Table: FC<{ data: Object }> = (props): ReactElement => {


  const data = () => {
    const newData: { col1: string; col2: string }[] = []

    for (const [key, value] of Object.entries(props.data)) {
      newData.push({ col1: key, col2: value })
    }
    return newData
  }

  type Cols = { col1: string; col2: string };

  const columns: Column<{ col1: string; col2: string }>[] = React.useMemo(
    () => [
      {
        Header: "",
        accessor: "col1" // accessor is the "key" in the data
      },
      {
        Header: "",
        accessor: "col2",
        style: {
          fontWeight: "bold",
          margin: 0,
          padding: '0.5rem',
          borderBottom: '1px solid black',
          borderRight: '1px solid black'
        }
      }
    ],
    []
  );

  const options: TableOptions<{ col1: string; col2: string }> = {
    data: data(),
    columns
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(options);


  return (
    <Stack>

      <table {...getTableProps()} style={{ border: "solid 1px" }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  style={{

                  }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      style={{
                        margin: 0,
                        padding: '0.5rem',
                        borderBottom: '1px solid black',
                        borderRight: '1px solid black'
                      }}
                      {...cell.getCellProps([
                        {
                          className: cell.column.className,
                          style: cell.column.style,
                        },
                      ])}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Stack >
  );
};

export default Table