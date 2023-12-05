import { SchemaCore } from "../types";
import createForm from "./createForm";

export const evaluate = <Schema extends SchemaCore>(
  schemas: Schema[],
  values: Record<any, any> = {},
  extraData: Record<any, any> = {},
) => {
  const form = createForm({ schemas, initialValues: values, extraData });

  return {
    values: form.state.fieldsState.values,
    errors: form.state.fieldsState.errors,
  };
};

export default evaluate;
