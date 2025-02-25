'use client';
// React Grid Logic
import React, { useEffect, useMemo, useState } from "react";

// Theme
import type {
  ColDef,
  RowSelectionOptions,
  ValueFormatterParams,
  GridReadyEvent,
} from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, } from 'ag-grid-community';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import api from 'src/api/axiosConfig';

ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Cell Renderer (Display logos based on cell value)
//removed
// Custom Cell Renderer (Display tick / cross in 'Successful' column) 
//removed

/* Format Date Cells */
const dateFormatter = (params: ValueFormatterParams): string => {
  return new Date(params.value).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Row Data Interface
interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt:string
}

const rowSelection: RowSelectionOptions = {
  mode: "multiRow",
  headerCheckbox: false,
};

// Create new GridExample component
const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IProduct[]>([]);

  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState<ColDef[]>([
    {
      field: "id",
      headerName: "Product ID",
      width: 100,
    },
    {
      field: "name",
      headerName: "Product Name",
      width: 200,
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
    },
    {
      field: "price",
      headerName: "Price",
      width: 130,
      valueFormatter: (params: ValueFormatterParams) => {
        return "£" + params.value
      },
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
    },
      {
          field: "createdAt",
          headerName: "Created At",
          valueFormatter: dateFormatter,
          width: 200
      },
      {
          field: "updatedAt",
          headerName: "Updated At",
          valueFormatter: dateFormatter,
          width: 200
      },
  ]);

  // Fetch data & update rowData state
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products'); // Assuming your API endpoint is /products
        setRowData(response.data);
          console.log('response',response.data)
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: false, //set to false  by default
      resizable:true
    };
  }, []);

  // Container: Defines the grid's theme & dimensions.
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        rowSelection={rowSelection}
        onSelectionChanged={(event) => console.log("Row Selected!")}
        onGridReady={(params: GridReadyEvent) => params.api.sizeColumnsToFit()}
          //we remove this event in the new version
        //onCellValueChanged={(event) =>
        //  console.log(`New Cell Value: ${event.value}`)
        //}
      />
    </div>
  );
};
 
export default function Products() {
  return (
    <>
      <GridExample />
    </>
  )
}
