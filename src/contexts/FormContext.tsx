import { FC, createContext } from "react";
import useForm from "../hooks/useForm";

export const FormContext = createContext<ReturnType<(typeof useForm<any>)>>({} as any);

export const FormProvider: FC<{
  value: any;
  children: any;
}> = ({ value, children }) => (
  <FormContext.Provider value={value}>
    {children}
  </FormContext.Provider>
);