import { FC, createContext } from "react";
import useForm from "../hooks/useForm";

export type FormContextValue = ReturnType<(typeof useForm<any>)>;

export const FormContext = createContext<FormContextValue>({} as any);

export const FormProvider: FC<{
  value: FormContextValue;
  children: any;
}> = ({ value, children }) => (
  <FormContext.Provider value={value}>
    {children}
  </FormContext.Provider>
);