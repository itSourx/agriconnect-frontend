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
import SalesOverview from "./list";

ModuleRegistry.registerModules([AllCommunityModule]);


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
  id: string;
  Name: string;
  description?: string;
  price?: number;
  quantity?: number;
  CreatedDate: string;
  category?: string;
  imageUrl?: string; // Add imageUrl property
}

const rowSelection: RowSelectionOptions = {
  mode: "multiRow",
  headerCheckbox: false,
};

// Image Component Cell Renderer
const ImageCellRenderer = (props: CustomCellRendererProps<IProduct>) => {
  return (
    <img
      src={props.data?.imageUrl}
      alt={props.data?.Name}
      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius:'50%' }}
    />
  );
};

// Create new GridExample component
const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IProduct[]>([]);

  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState<ColDef[]>([
    {
        field: "imageUrl",
        headerName: "Product Image",
        cellRenderer: ImageCellRenderer,
        width: 100,
        sortable:false,
        filter:false
    },
    {
      field: "Name",
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
        return params.value ? "£" + params.value : "N/A";
      },
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 100,
      valueFormatter: (params: ValueFormatterParams) => {
        return params.value ? params.value : "N/A";
      },
    },
    {
        field: "category",
        headerName: "category",
        width: 150,
        valueFormatter: (params: ValueFormatterParams) => {
            return params.value ? params.value : "N/A";
        },
    },
      {
          field: "CreatedDate",
          headerName: "Created At",
          valueFormatter: dateFormatter,
          width: 200
      },

  ]);

  // Fetch data & update rowData state
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products'); // Assuming your API endpoint is /products
          // Transform the data to match the IProduct interface
          const transformedData = response.data.map((item: any) => ({
              id: item.fields.id, // Use id from fields
              Name: item.fields.Name,
              description: item.fields.description,
              price: item.fields.price,
              quantity: item.fields.quantity,
              CreatedDate: item.fields.CreatedDate,
              category: item.fields.category,
               imageUrl: item.fields.Gallery ? item.fields.Gallery[0].thumbnails.small.url : "" ,// Access the imageUrl from Gallery
          }));
          setRowData(transformedData);
          console.log('response', transformedData)
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
      />
    </div>
  );
};
 
export default function Products() {
  return (
    <>
      <SalesOverview />
    </>
  )
}
