import { FC, createContext } from "react";
import { SchemaCore, SchemaVariant } from "../types";

export type FormUiFieldProps<Schema extends SchemaCore = any> = {
  schema: Schema;
  wrapper?: any;
  schemas?: any[];
}

export type FormUiViewProps<Schema extends SchemaCore = any> = {
  schema: Schema;
  wrapper?: any;
  schemas?: any[];
}

export type FormUiGroupProps<Schema extends SchemaCore = any> = {
  schema: Schema;
  wrapper?: any;
  children: any;
  schemas?: any[];
};

export type FormUiFieldArrayProps<Schema extends SchemaCore = any> = {
  schema: Schema;
  wrapper?: any;
  schemas?: any[];
  children: FC<{
    value: Schema["config"]["defaultValue"],
    container: FC<{
      children: any;
      schema: Schema;
      index: number;
      containerProps?: Record<string, any>;
    }>;
    containerProps?: Record<string, any>
  }>
};

export type FormUiFieldObjectProps<Schema extends SchemaCore = any> = {
  schema: Schema;
  wrapper?: any;
  schemas?: any[];
  children: FC<{
    value: Record<string, any>,
    container: FC<{
      children: any;
      schema: Schema;
      index: number;
      containerProps?: Record<string, any>;
    }>
    containerProps?: Record<string, any>
  }>
};

export type FormUiContextValue = {
  components: {
    [SchemaVariant.FIELD]: Record<string, FC<FormUiFieldProps>>
    [SchemaVariant.VIEW]: Record<string, FC<FormUiViewProps>>
    [SchemaVariant.FIELD_ARRAY]: {
      [key: string]: FC<FormUiFieldArrayProps>
    }
    [SchemaVariant.FIELD_OBJECT]: {
      [key: string]: FC<FormUiFieldObjectProps>
    },
    [SchemaVariant.GROUP]: {
      [key: string]: FC<FormUiGroupProps>
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