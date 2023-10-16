import { FC, createContext } from "react";
import { SchemaVariant } from "../types";

export type FormUiContextValue = {
  components: {
    [SchemaVariant.FIELD]: Record<string, FC<any>>
    [SchemaVariant.VIEW]: Record<string, FC<any>>
    [SchemaVariant.FIELD_ARRAY]: {
      [key: string]: FC<{
        schema: any;
        wrapper?: any;
        schemas?: any[];
        children: FC<{
          value: any[],
          container: FC<{
            children: any;
            schema: any;
            index: number;
            containerProps?: Record<string, any>;
          }>;
          containerProps?: Record<string, any>
        }>
      }>
    }
    [SchemaVariant.FIELD_OBJECT]: {
      [key: string]: FC<{
        schema: any;
        wrapper?: any;
        schemas?: any[];
        children: FC<{
          value: any[],
          container: FC<{
            children: any;
            schema: any;
            index: number;
            containerProps?: Record<string, any>;
          }>;
          containerProps?: Record<string, any>
        }>
      }>
    },
    [SchemaVariant.GROUP]: {
      [key: string]: FC<{
        schema: any;
        wrapper?: any;
        children: any;
        schemas?: any[];
      }>
    }
  }
}

export const FormUiContext = createContext<FormUiContextValue>({
  components: {
    [SchemaVariant.FIELD]: {},
    [SchemaVariant.VIEW]: {},
    [SchemaVariant.FIELD_ARRAY]: {},
    [SchemaVariant.FIELD_OBJECT]: {},
    [SchemaVariant.GROUP]: {},
  },
});

export const FormUiProvider: FC<{
  value: FormUiContextValue;
  children: any;
}> = ({ value, children }) => (
  <FormUiContext.Provider value={value}>
    {children}
  </FormUiContext.Provider>
);